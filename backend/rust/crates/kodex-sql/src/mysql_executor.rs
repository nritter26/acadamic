use kodex_core::types::ExecResult;
use kodex_core::error::AppError;

pub async fn execute_mysql_query(connection_string: &str, query: &str) -> Result<ExecResult, AppError> {
    #[cfg(feature = "mysql")]
    {
        use mysql_async::prelude::*;
        use mysql_async::{OptsBuilder, Conn};

        let opts = OptsBuilder::from_opts(mysql_async::Opts::from_url(connection_string)
            .map_err(|e| AppError::Internal(format!("Invalid MySQL connection string: {}", e)))?);

        let mut conn = Conn::new(opts).await
            .map_err(|e| AppError::Internal(format!("MySQL connection failed: {}", e)))?;

        let is_select = query.trim().to_uppercase().starts_with("SELECT")
            || query.trim().to_uppercase().starts_with("WITH")
            || query.trim().to_uppercase().starts_with("SHOW")
            || query.trim().to_uppercase().starts_with("DESCRIBE")
            || query.trim().to_uppercase().starts_with("EXPLAIN");

        if is_select {
            let rows: Vec<mysql_async::Row> = conn.query(query).await
                .map_err(|e| AppError::Internal(format!("MySQL query error: {}", e)))?;

            if rows.is_empty() {
                return Ok(ExecResult { output: "Query returned no rows.".to_string(), error: None });
            }

            let columns: Vec<String> = rows[0].columns_ref().iter()
                .map(|c| c.name_str().to_string())
                .collect();

            let mut output = String::new();
            output.push_str(&format!("| {} |\n", columns.join(" | ")));
            output.push_str(&format!("| {} |\n", columns.iter().map(|_| "---".to_string()).collect::<Vec<_>>().join(" | ")));

            use mysql_async::Value;
            for row in &rows {
                let values: Vec<String> = (0..columns.len()).map(|i| {
                    let val: Option<Value> = row.get(i);
                    match val {
                        Some(Value::NULL) => "NULL".to_string(),
                        Some(Value::Bytes(ref b)) => String::from_utf8_lossy(b).to_string(),
                        Some(Value::Int(n)) => n.to_string(),
                        Some(Value::UInt(u)) => u.to_string(),
                        Some(Value::Float(f)) => format!("{:.4}", f),
                        Some(Value::Double(d)) => format!("{:.4}", d),
                        Some(Value::Date(y, m, d, h, min, s, us)) => format!("{}-{:02}-{:02} {:02}:{:02}:{:02}.{:06}", y, m, d, h, min, s, us),
                        Some(Value::Time(neg, d, h, m, s, us)) => format!("{}{}:{:02}:{:02}:{:02}.{:06}", if neg { "-" } else { "" }, d, h, m, s, us),
                        _ => "?".to_string(),
                    }
                }).collect();
                output.push_str(&format!("| {} |\n", values.join(" | ")));
            }

            output.push_str(&format!("\n({} rows returned)", rows.len()));
            Ok(ExecResult { output, error: None })
        } else {
            conn.exec_drop(query, ()).await
                .map_err(|e| AppError::Internal(format!("MySQL query error: {}", e)))?;
            Ok(ExecResult { output: format!("Query executed successfully."), error: None })
        }
    }

    #[cfg(not(feature = "mysql"))]
    {
        let _ = (connection_string, query);
        Err(AppError::Internal("MySQL support not compiled. Enable the 'mysql' feature.".to_string()))
    }
}

pub async fn check_mysql_connection(connection_string: &str) -> Result<String, String> {
    #[cfg(feature = "mysql")]
    {
        use mysql_async::prelude::*;
        let opts = mysql_async::OptsBuilder::from_opts(
            mysql_async::Opts::from_url(connection_string).map_err(|e| e.to_string())?
        );
        match mysql_async::Conn::new(opts).await {
            Ok(mut conn) => {
                let result: Result<Option<String>, _> = conn.query_first("SELECT 'connected' AS status").await;
                match result {
                    Ok(_) => Ok("connected".to_string()),
                    Err(e) => Err(format!("MySQL query failed: {}", e)),
                }
            }
            Err(e) => Err(format!("MySQL connection failed: {}", e)),
        }
    }

    #[cfg(not(feature = "mysql"))]
    {
        let _ = connection_string;
        Err("MySQL support not compiled".to_string())
    }
}

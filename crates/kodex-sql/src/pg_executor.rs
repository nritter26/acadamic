use kodex_core::types::ExecResult;
use kodex_core::error::AppError;

pub async fn execute_pg_query(connection_string: &str, query: &str) -> Result<ExecResult, AppError> {
    #[cfg(feature = "postgres")]
    {
        use tokio_postgres::NoTls;

        let (client, connection) = tokio_postgres::connect(connection_string, NoTls)
            .await
            .map_err(|e| AppError::Internal(format!("PostgreSQL connection failed: {}", e)))?;

        tokio::spawn(async move {
            if let Err(e) = connection.await {
                tracing::warn!("PostgreSQL connection error: {}", e);
            }
        });

        let is_select = query.trim().to_uppercase().starts_with("SELECT")
            || query.trim().to_uppercase().starts_with("WITH")
            || query.trim().to_uppercase().starts_with("SHOW")
            || query.trim().to_uppercase().starts_with("DESCRIBE")
            || query.trim().to_uppercase().starts_with("EXPLAIN");

        if is_select {
            let rows = client.query(query, &[]).await
                .map_err(|e| AppError::Internal(format!("PostgreSQL query error: {}", e)))?;

            if rows.is_empty() {
                return Ok(ExecResult { output: "Query returned no rows.".to_string(), error: None });
            }

            let columns: Vec<String> = rows[0].columns().iter().map(|c| c.name().to_string()).collect();
            let mut output = String::new();
            output.push_str(&format!("| {} |\n", columns.join(" | ")));
            output.push_str(&format!("| {} |\n", columns.iter().map(|_| "---".to_string()).collect::<Vec<_>>().join(" | ")));

            for row in &rows {
                let values: Vec<String> = columns.iter().map(|col| {
                    row.try_get::<_, String>(col.as_str()).ok()
                        .or_else(|| row.try_get::<_, i64>(col.as_str()).ok().map(|v| v.to_string()))
                        .or_else(|| row.try_get::<_, f64>(col.as_str()).ok().map(|v| format!("{:.4}", v)))
                        .or_else(|| row.try_get::<_, bool>(col.as_str()).ok().map(|v| v.to_string()))
                        .or_else(|| row.try_get::<_, serde_json::Value>(col.as_str()).ok().map(|v| v.to_string()))
                        .unwrap_or_else(|| "NULL".to_string())
                }).collect();
                output.push_str(&format!("| {} |\n", values.join(" | ")));
            }

            output.push_str(&format!("\n({} rows returned)", rows.len()));
            Ok(ExecResult { output, error: None })
        } else {
            let count = client.execute(query, &[]).await
                .map_err(|e| AppError::Internal(format!("PostgreSQL query error: {}", e)))?;
            Ok(ExecResult { output: format!("Query executed. {} row(s) affected.", count), error: None })
        }
    }

    #[cfg(not(feature = "postgres"))]
    {
        let _ = (connection_string, query);
        Err(AppError::Internal("PostgreSQL support not compiled. Enable the 'postgres' feature.".to_string()))
    }
}

pub async fn check_pg_connection(connection_string: &str) -> Result<String, String> {
    #[cfg(feature = "postgres")]
    {
        match tokio_postgres::connect(connection_string, tokio_postgres::NoTls).await {
            Ok((_client, connection)) => {
                tokio::spawn(async move { let _ = connection.await; });
                Ok("connected".to_string())
            }
            Err(e) => Err(format!("PostgreSQL connection failed: {}", e)),
        }
    }

    #[cfg(not(feature = "postgres"))]
    {
        let _ = connection_string;
        Err("PostgreSQL support not compiled".to_string())
    }
}

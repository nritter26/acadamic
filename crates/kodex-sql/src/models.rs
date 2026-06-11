use std::sync::Arc;
use rusqlite::params;
use tokio::sync::RwLock;

/// User operations on the auth database
pub struct AuthDb {
    conn: Arc<RwLock<rusqlite::Connection>>,
}

impl AuthDb {
    pub fn new(conn: Arc<RwLock<rusqlite::Connection>>) -> Self {
        Self { conn }
    }

    pub async fn create_user(&self, id: &str, email: &str, password_hash: &str, name: &str) -> Result<(), String> {
        let conn = self.conn.write().await;
        conn.execute(
            "INSERT INTO users (id, email, password_hash, name) VALUES (?1, ?2, ?3, ?4)",
            params![id, email, password_hash, name],
        ).map_err(|e| format!("Failed to create user: {e}"))?;
        Ok(())
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<Option<UserRecord>, String> {
        let conn = self.conn.read().await;
        let mut stmt = conn.prepare(
            "SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?1"
        ).map_err(|e| format!("Query prepare failed: {e}"))?;

        let mut rows = stmt.query(params![email])
            .map_err(|e| format!("Query failed: {e}"))?;

        match rows.next().map_err(|e| format!("Row fetch failed: {e}"))? {
            Some(row) => Ok(Some(UserRecord {
                id: row.get(0).map_err(|e| format!("Get id: {e}"))?,
                email: row.get(1).map_err(|e| format!("Get email: {e}"))?,
                password_hash: row.get(2).map_err(|e| format!("Get password_hash: {e}"))?,
                name: row.get(3).map_err(|e| format!("Get name: {e}"))?,
                created_at: row.get(4).map_err(|e| format!("Get created_at: {e}"))?,
            })),
            None => Ok(None),
        }
    }

    pub async fn get_user_by_id(&self, user_id: &str) -> Result<Option<UserPublicRecord>, String> {
        let conn = self.conn.read().await;
        let mut stmt = conn.prepare(
            "SELECT id, email, name, created_at FROM users WHERE id = ?1"
        ).map_err(|e| format!("Query prepare failed: {e}"))?;

        let mut rows = stmt.query(params![user_id])
            .map_err(|e| format!("Query failed: {e}"))?;

        match rows.next().map_err(|e| format!("Row fetch failed: {e}"))? {
            Some(row) => Ok(Some(UserPublicRecord {
                id: row.get(0).map_err(|e| format!("Get id: {e}"))?,
                email: row.get(1).map_err(|e| format!("Get email: {e}"))?,
                name: row.get(2).map_err(|e| format!("Get name: {e}"))?,
                created_at: row.get(3).map_err(|e| format!("Get created_at: {e}"))?,
            })),
            None => Ok(None),
        }
    }

    pub async fn email_exists(&self, email: &str) -> Result<bool, String> {
        let conn = self.conn.read().await;
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM users WHERE email = ?1",
            params![email],
            |row| row.get(0),
        ).map_err(|e| format!("Count query failed: {e}"))?;
        Ok(count > 0)
    }
}

#[derive(Debug, Clone)]
pub struct UserRecord {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct UserPublicRecord {
    pub id: String,
    pub email: String,
    pub name: String,
    pub created_at: String,
}

/// Project operations on the projects database
pub struct ProjectDb {
    conn: Arc<RwLock<rusqlite::Connection>>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProjectRecord {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub language: String,
    pub description: String,
    pub files: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProjectSummary {
    pub id: String,
    pub name: String,
    pub language: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
}

impl ProjectDb {
    pub fn new(conn: Arc<RwLock<rusqlite::Connection>>) -> Self {
        Self { conn }
    }

    pub async fn list_projects(&self, user_id: &str) -> Result<Vec<ProjectSummary>, String> {
        let conn = self.conn.read().await;
        let mut stmt = conn.prepare(
            "SELECT id, name, language, description, created_at, updated_at \
             FROM projects WHERE user_id = ?1 ORDER BY updated_at DESC"
        ).map_err(|e| format!("Query prepare failed: {e}"))?;

        let rows = stmt.query_map(params![user_id], |row| {
            Ok(ProjectSummary {
                id: row.get(0)?,
                name: row.get(1)?,
                language: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        }).map_err(|e| format!("Query failed: {e}"))?;

        let mut projects = Vec::new();
        for row in rows {
            projects.push(row.map_err(|e| format!("Row read: {e}"))?);
        }
        Ok(projects)
    }

    pub async fn get_project(&self, id: &str, user_id: &str) -> Result<Option<ProjectRecord>, String> {
        let conn = self.conn.read().await;
        let mut stmt = conn.prepare(
            "SELECT * FROM projects WHERE id = ?1 AND user_id = ?2"
        ).map_err(|e| format!("Query prepare failed: {e}"))?;

        let mut rows = stmt.query(params![id, user_id])
            .map_err(|e| format!("Query failed: {e}"))?;

        match rows.next().map_err(|e| format!("Row fetch failed: {e}"))? {
            Some(row) => Ok(Some(ProjectRecord {
                id: row.get::<_, String>(0).unwrap_or_default(),
                user_id: row.get::<_, String>(1).unwrap_or_default(),
                name: row.get::<_, String>(2).unwrap_or_default(),
                language: row.get::<_, String>(3).unwrap_or_default(),
                description: row.get::<_, String>(4).unwrap_or_default(),
                files: row.get::<_, String>(5).unwrap_or_default(),
                created_at: row.get::<_, String>(6).unwrap_or_default(),
                updated_at: row.get::<_, String>(7).unwrap_or_default(),
            })),
            None => Ok(None),
        }
    }

    pub async fn create_project(&self, id: &str, user_id: &str, name: &str, language: &str, description: &str) -> Result<(), String> {
        let conn = self.conn.write().await;
        conn.execute(
            "INSERT INTO projects (id, user_id, name, language, description) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, user_id, name, language, description],
        ).map_err(|e| format!("Failed to create project: {e}"))?;
        Ok(())
    }

    pub async fn update_project(&self, id: &str, user_id: &str, fields: &[(String, String)]) -> Result<(), String> {
        if fields.is_empty() {
            return Ok(());
        }
        let conn = self.conn.write().await;

        let mut sql = String::from("UPDATE projects SET ");
        for (i, (k, _)) in fields.iter().enumerate() {
            if i > 0 { sql.push_str(", "); }
            sql.push_str(&format!("{} = ?{}", k, i + 1));
        }
        sql.push_str(&format!(", updated_at = datetime('now') WHERE id = ?{} AND user_id = ?{}", fields.len() + 1, fields.len() + 2));

        let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
        for (_, v) in fields {
            param_values.push(Box::new(v.clone()));
        }
        param_values.push(Box::new(id.to_string()));
        param_values.push(Box::new(user_id.to_string()));

        let param_refs: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
        conn.execute(&sql, param_refs.as_slice())
            .map_err(|e| format!("Failed to update project: {e}"))?;
        Ok(())
    }

    pub async fn delete_project(&self, id: &str, user_id: &str) -> Result<bool, String> {
        let conn = self.conn.write().await;
        let affected = conn.execute(
            "DELETE FROM projects WHERE id = ?1 AND user_id = ?2",
            params![id, user_id],
        ).map_err(|e| format!("Failed to delete project: {e}"))?;
        Ok(affected > 0)
    }
}

/// Raw SQL execution for the in-memory database playground
pub fn execute_raw_sqlite(conn: &rusqlite::Connection, sql: &str) -> Result<String, String> {
    let statements = split_sql(sql);
    if statements.is_empty() {
        return Ok("(no statements to execute)".into());
    }

    let mut outputs = Vec::new();
    for stmt_str in &statements {
        if is_selectish(stmt_str) {
            let mut stmt = conn.prepare(stmt_str)
                .map_err(|e| format!("{}", e))?;
            let cols: Vec<String> = stmt.column_names().iter().map(|c| c.to_string()).collect();
            let rows: Vec<Vec<rusqlite::types::Value>> = stmt.query_map([], |row| {
                let mut values = Vec::new();
                for i in 0..row.as_ref().column_count() {
                    values.push(row.get::<_, rusqlite::types::Value>(i).unwrap_or(rusqlite::types::Value::Null));
                }
                Ok(values)
            }).map_err(|e| format!("{}", e))?
            .filter_map(|r| r.ok())
            .collect();

            outputs.push(format_query_result(&rows, &cols));
        } else {
            let changes = conn.execute(stmt_str, [])
                .map_err(|e| format!("{}", e))?;
            outputs.push(format!("Query OK, {} row(s) affected", changes));
        }
    }
    Ok(outputs.join("\n\n"))
}

fn is_selectish(sql: &str) -> bool {
    let trimmed = sql.trim().to_uppercase();
    let ok = ["SELECT", "WITH", "EXPLAIN", "PRAGMA", "SHOW", "DESCRIBE", "VALUES"];
    ok.iter().any(|kw| trimmed.starts_with(kw))
}

fn split_sql(sql: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut in_string: Option<char> = None;
    let chars: Vec<char> = sql.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];
        if let Some(quote) = in_string {
            current.push(ch);
            if ch == '\\' && i + 1 < chars.len() {
                i += 1;
                current.push(chars[i]);
            } else if ch == quote {
                in_string = None;
            }
        } else if ch == '\'' || ch == '"' {
            current.push(ch);
            in_string = Some(ch);
        } else if ch == ';' {
            let trimmed = current.trim().to_string();
            if !trimmed.is_empty() {
                result.push(trimmed);
            }
            current = String::new();
        } else {
            current.push(ch);
        }
        i += 1;
    }
    let trimmed = current.trim().to_string();
    if !trimmed.is_empty() {
        result.push(trimmed);
    }
    result
}

fn pad_right(s: &str, len: usize) -> String {
    if s.len() < len {
        let mut result = s.to_string();
        result.push_str(&" ".repeat(len - s.len()));
        result
    } else {
        s.to_string()
    }
}

fn format_query_result(rows: &[Vec<rusqlite::types::Value>], cols: &[String]) -> String {
    if rows.is_empty() {
        return "(0 rows)".into();
    }

    let mut widths: Vec<usize> = cols.iter().map(|c| std::cmp::max(c.len(), 8)).collect();
    for row in rows {
        for (i, val) in row.iter().enumerate() {
            if i < widths.len() {
                let s = match val {
                    rusqlite::types::Value::Null => "NULL".into(),
                    _ => format!("{:?}", val),
                };
                if s.len() > widths[i] {
                    widths[i] = std::cmp::min(s.len(), 80);
                }
            }
        }
    }

    let total_width: usize = widths.iter().map(|w| w + 3).sum::<usize>() + 1;
    let mut out = String::new();
    out.push('┌');
    out.push_str(&"─".repeat(total_width - 2));
    out.push('┐');
    out.push('\n');

    out.push('│');
    for (i, col) in cols.iter().enumerate() {
        out.push(' ');
        out.push_str(&pad_right(col, widths[i]));
        out.push_str(" │");
    }
    out.push('\n');

    out.push('├');
    for (i, w) in widths.iter().enumerate() {
        if i > 0 { out.push('┬'); }
        out.push_str(&"─".repeat(w + 2));
    }
    out.push('┤');
    out.push('\n');

    let max_rows = 200;
    let display_rows = if rows.len() > max_rows { &rows[..max_rows] } else { rows };

    for row in display_rows {
        out.push('│');
        for (i, val) in row.iter().enumerate() {
            let s = match val {
                rusqlite::types::Value::Null => "NULL".into(),
                _ => format!("{:?}", val),
            };
            let truncated = if s.len() > 80 {
                format!("{}...", &s[..77])
            } else {
                s
            };
            out.push(' ');
            out.push_str(&pad_right(&truncated, widths[i]));
            out.push_str(" │");
        }
        out.push('\n');
    }

    if rows.len() > max_rows {
        let msg = format!("... {} more rows", rows.len() - max_rows);
        out.push('│');
        out.push(' ');
        out.push_str(&pad_right(&msg, total_width - 4));
        out.push_str(" │\n");
    }

    out.push('└');
    for (i, w) in widths.iter().enumerate() {
        if i > 0 { out.push('┴'); }
        out.push_str(&"─".repeat(w + 2));
    }
    out.push('┘');
    out.push('\n');
    out.push_str(&format!("({} rows)", rows.len()));

    out
}

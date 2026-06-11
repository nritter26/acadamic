use std::path::PathBuf;
use std::sync::Arc;

use rusqlite::Connection;
use tokio::sync::RwLock;
use tracing::info;

/// Manages three SQLite databases:
/// 1. In-memory curriculum DB (seeded from seed.sql)
/// 2. File-based auth.db (users)
/// 3. File-based projects.db (projects)
pub struct DbManager {
    /// Main curriculum database (in-memory, r2d2 pooled)
    pub curriculum: r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>,
    /// Auth database (file-based, single connection)
    pub auth: Arc<RwLock<Connection>>,
    /// Projects database (file-based, single connection)
    pub projects: Arc<RwLock<Connection>>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct DbInitStatus {
    pub sqlite: kodex_core::types::DbInitStatus,
    pub pg: kodex_core::types::DbInitStatus,
    pub mysql: kodex_core::types::DbInitStatus,
}

impl DbManager {
    pub fn new(data_dir: &PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(data_dir).map_err(|e| format!("Failed to create data dir: {e}"))?;

        // Curriculum: in-memory SQLite with seed
        let curri_manager = r2d2_sqlite::SqliteConnectionManager::memory();
        let pool = r2d2::Pool::builder()
            .max_size(8)
            .build(curri_manager)
            .map_err(|e| format!("Failed to build curriculum pool: {e}"))?;

        {
            let conn = pool.get().map_err(|e| format!("Failed to get curriculum connection: {e}"))?;
            let seed_path = data_dir.join("..").join("backend").join("sql").join("seed.sql");
            if seed_path.exists() {
                let sql = std::fs::read_to_string(&seed_path)
                    .map_err(|e| format!("Failed to read seed.sql: {e}"))?;
                conn.execute_batch(&sql)
                    .map_err(|e| format!("Failed to execute seed.sql: {e}"))?;
                info!("Curriculum database seeded from {:?}", seed_path);
            } else {
                info!("No seed.sql found at {:?}, curriculum DB is empty", seed_path);
            }
        }

        // Auth DB
        let auth_path = data_dir.join("auth.db");
        let auth_conn = Connection::open(&auth_path)
            .map_err(|e| format!("Failed to open auth.db: {e}"))?;
        auth_conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT DEFAULT '',
                created_at TEXT DEFAULT (datetime('now'))
            )"
        ).map_err(|e| format!("Failed to init auth schema: {e}"))?;

        // Projects DB
        let projects_path = data_dir.join("projects.db");
        let projects_conn = Connection::open(&projects_path)
            .map_err(|e| format!("Failed to open projects.db: {e}"))?;
        projects_conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                language TEXT DEFAULT 'js',
                description TEXT DEFAULT '',
                files TEXT DEFAULT '{}',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )"
        ).map_err(|e| format!("Failed to init projects schema: {e}"))?;

        info!("All databases initialized");

        Ok(Self {
            curriculum: pool,
            auth: Arc::new(RwLock::new(auth_conn)),
            projects: Arc::new(RwLock::new(projects_conn)),
        })
    }

    pub fn get_status(&self) -> DbInitStatus {
        let sqlite_ok = self.curriculum.get().is_ok();
        DbInitStatus {
            sqlite: kodex_core::types::DbInitStatus {
                available: sqlite_ok,
                reason: None,
                error: None,
            },
            pg: kodex_core::types::DbInitStatus {
                available: false,
                reason: Some("PostgreSQL not configured".into()),
                error: None,
            },
            mysql: kodex_core::types::DbInitStatus {
                available: false,
                reason: Some("MySQL not configured".into()),
                error: None,
            },
        }
    }
}

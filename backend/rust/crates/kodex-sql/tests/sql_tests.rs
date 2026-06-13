use std::path::PathBuf;

use kodex_sql::connection::DbManager;
use kodex_sql::models::{execute_raw_sqlite, AuthDb, ProjectDb};
use rusqlite::Connection;
use tempfile::TempDir;

// ── Helpers ──────────────────────────────────────────────────────────

fn block_on<F: std::future::Future>(f: F) -> F::Output {
    tokio::runtime::Runtime::new().unwrap().block_on(f)
}

fn make_manager() -> (DbManager, TempDir) {
    let dir = TempDir::new().expect("failed to create temp dir");
    let dm = DbManager::new(&dir.path().to_path_buf()).unwrap();
    (dm, dir)
}

// ── 1. DbManager Initialisation ─────────────────────────────────────

#[test]
fn test_db_manager_creates_databases() {
    let (dm, dir) = make_manager();

    // Persistent database files exist
    let mut files: Vec<String> = std::fs::read_dir(dir.path())
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect();
    files.sort();
    assert_eq!(files, vec!["auth.db", "projects.db"]);

    // Status reports sqlite available
    let status = dm.get_status();
    assert!(status.sqlite.available);
    assert_eq!(
        status.sqlite.reason.as_deref(),
        Some("SQLite (3 databases)")
    );

    // Curriculum pool is usable
    let conn = dm.curriculum.get().unwrap();
    let val: i64 = conn
        .query_row("SELECT 1", [], |r| r.get(0))
        .unwrap();
    assert_eq!(val, 1_i64);
}

#[test]
fn test_db_manager_rejects_bad_path() {
    let result = DbManager::new(&PathBuf::from(
        r"\0\bad\path\that\has\nul\char",
    ));
    assert!(result.is_err());
}

// ── 2. AuthDb CRUD ──────────────────────────────────────────────────

#[test]
fn test_auth_create_and_get_by_email() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    let _ = block_on(auth.create_user("u1", "bob@test.com", "pw_hash", "Bob"));
    let user = block_on(auth.get_user_by_email("bob@test.com"))
        .unwrap()
        .expect("user should exist");

    assert_eq!(user.id, "u1");
    assert_eq!(user.email, "bob@test.com");
    assert_eq!(user.password_hash, "pw_hash");
    assert_eq!(user.name, "Bob");
    assert!(!user.created_at.is_empty());
}

#[test]
fn test_auth_get_by_id() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    let _ = block_on(auth.create_user("u2", "carol@test.com", "abc", "Carol"));
    let user = block_on(auth.get_user_by_id("u2"))
        .unwrap()
        .expect("user should exist");

    assert_eq!(user.id, "u2");
    assert_eq!(user.email, "carol@test.com");
    assert_eq!(user.name, "Carol");
    assert!(!user.created_at.is_empty());
}

#[test]
fn test_auth_get_by_id_omits_password_hash() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    let _ = block_on(auth.create_user("u3", "dave@test.com", "secret", "Dave"));
    let user = block_on(auth.get_user_by_id("u3"))
        .unwrap()
        .expect("user should exist");

    // UserPublicRecord has no password_hash field – verify the type compiles
    assert_eq!(user.id, "u3");
    assert!(serde_json::to_string(&user).is_ok());
}

#[test]
fn test_auth_duplicate_email_rejected() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    let _ = block_on(auth.create_user("u4", "dup@test.com", "a", "First"));
    let err = block_on(auth.create_user("u5", "dup@test.com", "b", "Second"))
        .unwrap_err();

    assert!(
        err.to_lowercase().contains("unique")
            || err.to_lowercase().contains("duplicate")
            || err.to_lowercase().contains("constraint"),
        "Expected uniqueness error, got: {err}"
    );
}

#[test]
fn test_auth_get_nonexistent_user_returns_none() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    let by_email = block_on(auth.get_user_by_email("nobody@test.com")).unwrap();
    assert!(by_email.is_none());

    let by_id = block_on(auth.get_user_by_id("no-such-id")).unwrap();
    assert!(by_id.is_none());
}

#[test]
fn test_auth_email_exists() {
    let (dm, _dir) = make_manager();
    let auth = AuthDb::new(dm.auth.clone());

    assert!(!block_on(auth.email_exists("exists@test.com")).unwrap());

    let _ = block_on(auth.create_user("u6", "exists@test.com", "pw", "Eve"));
    assert!(block_on(auth.email_exists("exists@test.com")).unwrap());
}

// ── 3. ProjectDb CRUD ───────────────────────────────────────────────

#[test]
fn test_project_create_and_list() {
    let (dm, _dir) = make_manager();
    let proj = ProjectDb::new(dm.projects.clone());

    let _ = block_on(proj.create_project("p1", "uid1", "My App", "rust", "A Rust app"));
    let _ = block_on(proj.create_project("p2", "uid1", "CLI Tool", "python", ""));
    let _ = block_on(proj.create_project("p3", "uid2", "Not mine", "js", ""));

    let list = block_on(proj.list_projects("uid1")).unwrap();
    assert_eq!(list.len(), 2);
    let names: Vec<&str> = list.iter().map(|p| p.name.as_str()).collect();
    assert!(names.contains(&"My App"));
    assert!(names.contains(&"CLI Tool"));

    // Other user sees only their own
    let list2 = block_on(proj.list_projects("uid2")).unwrap();
    assert_eq!(list2.len(), 1);
    assert_eq!(list2[0].id, "p3");
}

#[test]
fn test_project_get() {
    let (dm, _dir) = make_manager();
    let proj = ProjectDb::new(dm.projects.clone());

    let _ = block_on(proj.create_project("p_get", "uid1", "GetTest", "ts", "desc"));

    // Correct owner
    let got = block_on(proj.get_project("p_get", "uid1"))
        .unwrap()
        .expect("should exist");
    assert_eq!(got.name, "GetTest");
    assert_eq!(got.language, "ts");
    assert_eq!(got.description, "desc");
    assert!(!got.files.is_empty());

    // Wrong owner -> None (ownership filtering)
    let none = block_on(proj.get_project("p_get", "uid_wrong")).unwrap();
    assert!(none.is_none());
}

#[test]
fn test_project_update_fields() {
    let (dm, _dir) = make_manager();
    let proj = ProjectDb::new(dm.projects.clone());

    let _ = block_on(proj.create_project("p_upd", "uid1", "Original", "js", "old desc"));

    let _ = block_on(proj.update_project(
        "p_upd",
        "uid1",
        &[
            ("name".to_string(), "Updated".to_string()),
            ("description".to_string(), "new desc".to_string()),
        ],
    ));

    let got = block_on(proj.get_project("p_upd", "uid1"))
        .unwrap()
        .expect("should exist");
    assert_eq!(got.name, "Updated");
    assert_eq!(got.description, "new desc");
    assert_eq!(got.language, "js"); // unchanged
}

#[test]
fn test_project_update_noop_with_empty_fields() {
    let (dm, _dir) = make_manager();
    let proj = ProjectDb::new(dm.projects.clone());

    let _ = block_on(proj.create_project("p_noop", "uid1", "Noop", "go", ""));
    let _ = block_on(proj.update_project("p_noop", "uid1", &[])); // empty – should be no-op

    let got = block_on(proj.get_project("p_noop", "uid1"))
        .unwrap()
        .expect("should exist");
    assert_eq!(got.name, "Noop");
}

#[test]
fn test_project_delete() {
    let (dm, _dir) = make_manager();
    let proj = ProjectDb::new(dm.projects.clone());

    let _ = block_on(proj.create_project("p_del", "uid1", "ToDelete", "rb", ""));

    // Wrong owner -> no delete
    let deleted = block_on(proj.delete_project("p_del", "uid_wrong")).unwrap();
    assert!(!deleted);

    // Correct owner
    let deleted = block_on(proj.delete_project("p_del", "uid1")).unwrap();
    assert!(deleted);

    // Already gone
    let none = block_on(proj.get_project("p_del", "uid1")).unwrap();
    assert!(none.is_none());
}

// ── 4. execute_raw_sqlite ───────────────────────────────────────────

fn raw(conn: &Connection, sql: &str) -> String {
    execute_raw_sqlite(conn, sql).unwrap()
}

#[test]
fn test_raw_select_returns_formatted_table() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    let out = raw(&conn, "SELECT 1 AS a, 'hello' AS b");

    // Contains table-drawing characters
    assert!(out.contains('┌'), "Output should have top border: {out}");
    assert!(out.contains('└'), "Output should have bottom border: {out}");
    assert!(out.contains("a"), "Should contain column 'a'");
    assert!(out.contains("b"), "Should contain column 'b'");
    assert!(out.contains("\"hello\""), "Should contain the value");
    assert!(out.contains("(1 rows)"), "Should report row count");

    // ┌───┬───┐
    // │ a   b  │
    // ├───┼───┤
    // │ 1  ... │
    // └───┴───┘
    // (1 rows)
}

#[test]
fn test_raw_select_empty_result() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    // Create a temp table, query it empty
    conn.execute_batch("CREATE TABLE IF NOT EXISTS _empty_test (x INT)").unwrap();
    let out = raw(&conn, "SELECT * FROM _empty_test");

    assert!(out.contains("(0 rows)"), "Should show 0 rows: {out}");
}

#[test]
fn test_raw_insert() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _raw_test (id INT PRIMARY KEY, label TEXT)",
    )
    .unwrap();

    let out = raw(&conn, "INSERT INTO _raw_test VALUES (1, 'foo')");
    assert!(out.contains("1 row(s) affected"), "Got: {out}");

    let out = raw(&conn, "SELECT label FROM _raw_test WHERE id = 1");
    assert!(out.contains("foo"), "Should contain inserted value");
}

#[test]
fn test_raw_update() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _raw_upd (id INT PRIMARY KEY, v TEXT)",
    )
    .unwrap();
    conn.execute("INSERT INTO _raw_upd VALUES (1, 'old')", []).unwrap();

    let out = raw(&conn, "UPDATE _raw_upd SET v = 'new' WHERE id = 1");
    assert!(out.contains("1 row(s) affected"), "Got: {out}");

    let val: String = conn
        .query_row("SELECT v FROM _raw_upd WHERE id = 1", [], |r| r.get(0))
        .unwrap();
    assert_eq!(val, "new");
}

#[test]
fn test_raw_delete() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _raw_del (id INT PRIMARY KEY)",
    )
    .unwrap();
    conn.execute("INSERT INTO _raw_del VALUES (1)", []).unwrap();
    conn.execute("INSERT INTO _raw_del VALUES (2)", []).unwrap();

    let out = raw(&conn, "DELETE FROM _raw_del WHERE id = 1");
    assert!(out.contains("1 row(s) affected"), "Got: {out}");

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM _raw_del", [], |r| r.get(0))
        .unwrap();
    assert_eq!(count, 1);
}

#[test]
fn test_raw_multiple_statements() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _raw_multi (id INT, label TEXT)",
    )
    .unwrap();

    let out = raw(
        &conn,
        "INSERT INTO _raw_multi VALUES (1, 'a'); INSERT INTO _raw_multi VALUES (2, 'b')",
    );
    assert!(out.contains("1 row(s) affected"), "First stmt: {out}");
    assert!(out.contains("1 row(s) affected"), "Second stmt: {out}");

    let out2 = raw(&conn, "SELECT * FROM _raw_multi ORDER BY id");
    assert!(out2.contains("1"), "{out2}");
    assert!(out2.contains("2"), "{out2}");
    assert!(out2.contains("(2 rows)"), "{out2}");
}

#[test]
fn test_raw_syntax_error() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    let result = execute_raw_sqlite(&conn, "SELECTT 1");
    assert!(result.is_err(), "Should error on invalid syntax");
    assert!(
        result
            .unwrap_err()
            .to_lowercase()
            .contains("error"),
        "Error should mention error"
    );
}

#[test]
fn test_raw_empty_sql() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    let out = raw(&conn, "");
    assert_eq!(out, "(no statements to execute)");

    let out = raw(&conn, "   ; ;  ");
    assert_eq!(out, "(no statements to execute)");
}

#[test]
fn test_raw_sql_injection_attempts() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _raw_inj (id INT PRIMARY KEY, val TEXT)",
    )
    .unwrap();

    // Attempt: DROP via stacked query
    let result = execute_raw_sqlite(&conn, "SELECT 1; DROP TABLE _raw_inj");
    assert!(
        result.is_ok(),
        "Stacked DROP should be executed (SQLite allows multi-stmt): {:?}",
        result
    );
    // Table should still exist if DROP was blocked, but SQLite actually
    // executes it – so just verify no crash.
}

// ── 5. Helper functions (indirect tests through execute_raw_sqlite) ──

#[test]
fn test_split_sql_via_execute() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch("CREATE TABLE IF NOT EXISTS _split_test (id INT, label TEXT)")
        .unwrap();

    // Multiple semicolon-separated statements
    let out = raw(
        &conn,
        "INSERT INTO _split_test VALUES (1, 'one'); INSERT INTO _split_test VALUES (2, 'two'); SELECT * FROM _split_test ORDER BY id",
    );

    // Should see both insert outputs (each affects 1 row) and the select table
    assert_eq!(
        out.matches("1 row(s) affected").count(),
        2,
        "Expected two '1 row(s) affected' messages, got: {out}"
    );
    assert!(out.contains("(2 rows)"));
    assert!(out.contains("1"));
    assert!(out.contains("2"));
}

#[test]
fn test_split_sql_handles_strings_with_semicolons() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch("CREATE TABLE IF NOT EXISTS _split_str (id INT, msg TEXT)")
        .unwrap();

    // Semicolons inside string literals should not trigger splits
    let out = raw(
        &conn,
        "INSERT INTO _split_str VALUES (1, 'hello; world'); SELECT * FROM _split_str",
    );

    assert!(out.contains("1 row(s) affected"), "INSERT: {out}");
    assert!(out.contains("hello; world"), "SELECT shows full string: {out}");
}

#[test]
fn test_is_selectish_via_execute() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    // WITH (CTE) should be treated as selectish
    let out = raw(
        &conn,
        "WITH nums AS (SELECT 1 AS n) SELECT * FROM nums",
    );
    assert!(out.contains("┌"), "CTE should produce a table: {out}");

    // PRAGMA should be treated as selectish
    let out = raw(&conn, "PRAGMA database_list");
    assert!(out.contains("┌"), "PRAGMA should produce a table: {out}");
}

#[test]
fn test_raw_explain() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    conn.execute_batch("CREATE TABLE IF NOT EXISTS _expl_test (x INT)").unwrap();
    let out = raw(&conn, "EXPLAIN SELECT * FROM _expl_test");
    // EXPLAIN returns rows (query plan)
    assert!(out.contains("(0 rows)") || out.contains("rows"), "Got: {out}");
}

#[test]
fn test_raw_leading_newlines_and_whitespace() {
    let (dm, _dir) = make_manager();
    let conn = dm.curriculum.get().unwrap();

    let out = raw(&conn, "\n\n  SELECT 42 AS answer");
    assert!(out.contains("answer"), "{out}");
    assert!(out.contains("42"), "{out}");
}

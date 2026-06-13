use std::path::Path;
use kodex_ai::conversation::ConversationStore;

fn test_dir() -> tempfile::TempDir {
    tempfile::tempdir().unwrap()
}

#[tokio::test]
async fn test_empty_history() {
    let dir = test_dir();
    let store = ConversationStore::new(dir.path());
    let history = store.get_history("nonexistent").await.unwrap();
    assert!(history.is_empty());
}

#[tokio::test]
async fn test_append_and_get() {
    let dir = test_dir();
    let store = ConversationStore::new(dir.path());
    store.append("user1", "user", "What is a variable?").await.unwrap();
    store.append("user1", "assistant", "A variable stores data.").await.unwrap();
    let history = store.get_history("user1").await.unwrap();
    assert_eq!(history.len(), 2);
    assert_eq!(history[0].role, "user");
    assert_eq!(history[0].text, "What is a variable?");
    assert_eq!(history[1].role, "assistant");
    assert_eq!(history[1].text, "A variable stores data.");
}

#[tokio::test]
async fn test_clear_history() {
    let dir = test_dir();
    let store = ConversationStore::new(dir.path());
    store.append("user2", "user", "Hello").await.unwrap();
    assert_eq!(store.get_history("user2").await.unwrap().len(), 1);
    store.clear("user2").await.unwrap();
    assert!(store.get_history("user2").await.unwrap().is_empty());
}

#[tokio::test]
async fn test_append_many() {
    let dir = test_dir();
    let store = ConversationStore::new(dir.path());
    for i in 0..60 {
        let msg = format!("Message {}", i);
        store.append("user3", "user", &msg).await.unwrap();
    }
    let history = store.get_history("user3").await.unwrap();
    assert_eq!(history.len(), 50, "Should be capped at 50");
    assert_eq!(history[0].text, "Message 10", "Should keep the last 50");
    assert_eq!(history[49].text, "Message 59");
}

#[tokio::test]
async fn test_separate_learners() {
    let dir = test_dir();
    let store = ConversationStore::new(dir.path());
    store.append("alice", "user", "Hi").await.unwrap();
    store.append("bob", "user", "Hey").await.unwrap();
    assert_eq!(store.get_history("alice").await.unwrap().len(), 1);
    assert_eq!(store.get_history("bob").await.unwrap().len(), 1);
}

#[tokio::test]
async fn test_file_persistence() {
    let dir = test_dir();
    let path = dir.path().to_path_buf();
    {
        let store = ConversationStore::new(&path);
        store.append("persist", "user", "Hello!").await.unwrap();
    }
    let store2 = ConversationStore::new(&path);
    let history = store2.get_history("persist").await.unwrap();
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].text, "Hello!");
}

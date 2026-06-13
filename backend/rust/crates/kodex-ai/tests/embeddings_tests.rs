use kodex_ai::embeddings::EmbeddingEngine;

#[tokio::test]
async fn test_embedding_search() {
    let mut engine = EmbeddingEngine::new();

    // Test with default topics (no content dir)
    let content_dir = std::path::Path::new("nonexistent");
    engine.build_from_content(content_dir).await.unwrap();

    // Search for programming-related topics
    let results = engine.search("how do I write a function", 3);
    assert!(!results.is_empty(), "Should find function-related topics");

    let top_topic = &results[0].0;
    assert!(top_topic.contains("function"), "Top result should be function-related");
}

#[test]
fn test_tokenize() {
    let tokens = kodex_ai::embeddings::tokenize("Hello World! This is a test.");
    assert!(!tokens.is_empty());
    assert!(tokens.iter().any(|t| t == "hello"));
    assert!(tokens.iter().any(|t| t == "world"));
}

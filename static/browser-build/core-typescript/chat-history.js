// @ts-nocheck
var CHAT_STORAGE_KEY = 'dogeslab_chat';
var MAX_HISTORY = 50;
var conversationHistory = [];
function saveChatHistory() {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-20)));
    }
    catch { }
}
function loadChatHistory() {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                conversationHistory = parsed.slice(-20);
                return conversationHistory;
            }
        }
    }
    catch { }
    return [];
}
function getHistory() {
    return conversationHistory;
}
function addToHistory(role, text) {
    conversationHistory.push({ role, text });
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
    saveChatHistory();
}
function clearHistory() {
    conversationHistory = [];
    try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
    }
    catch { }
}

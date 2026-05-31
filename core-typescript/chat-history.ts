const CHAT_STORAGE_KEY = 'dogeslab_chat';
const MAX_HISTORY = 50;
let conversationHistory: { role: string; text: string }[] = [];

function saveChatHistory(): void {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-20))); } catch {}
}

function loadChatHistory(): void {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                conversationHistory = parsed.slice(-20);
                const el = document.getElementById('aiMessages');
                if (el) {
                    el.innerHTML = '';
                    for (const msg of conversationHistory) {
                        addAIMessage(msg.text, msg.role, true);
                    }
                }
            }
        }
    } catch {}
}

function getHistory(): { role: string; text: string }[] {
    return conversationHistory;
}

function clearHistory(): void {
    conversationHistory = [];
    try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
}

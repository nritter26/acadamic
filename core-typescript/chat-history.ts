export const CHAT_STORAGE_KEY = 'dogeslab_chat';
export const MAX_HISTORY = 50;
export let conversationHistory: { role: string; text: string }[] = [];

function saveChatHistory(): void {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-20))); } catch {}
}

export function loadChatHistory(): { role: string; text: string }[] {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                conversationHistory = parsed.slice(-20);
                return conversationHistory;
            }
        }
    } catch {}
    return [];
}

export function getHistory(): { role: string; text: string }[] {
    return conversationHistory;
}

export function addToHistory(role: string, text: string): void {
    conversationHistory.push({ role, text });
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
    saveChatHistory();
}

export function clearHistory(): void {
    conversationHistory = [];
    try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
}

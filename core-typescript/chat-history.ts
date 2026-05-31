export const CHAT_STORAGE_KEY = 'dogeslab_chat';
export const MAX_HISTORY = 50;
export let conversationHistory: { role: string; text: string }[] = [];

export function saveChatHistory(history: { role: string; text: string }[]): void {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history.slice(-20))); } catch {}
}

export function loadChatHistory(): { role: string; text: string }[] {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed.slice(-20);
        }
    } catch {}
    return [];
}

export function getHistory(): { role: string; text: string }[] {
    return conversationHistory;
}

export function addToHistory(history: { role: string; text: string }[], role: string, text: string): { role: string; text: string }[] {
    history.push({ role, text });
    if (history.length > MAX_HISTORY) history.shift();
    saveChatHistory(history);
    return history;
}

export function clearHistory(): void {
    conversationHistory = [];
    try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
}

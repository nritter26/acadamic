interface ConversationEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}
export declare function addMessage(learnerId: string, role: 'user' | 'assistant', content: string): Promise<void>;
export declare function getHistory(learnerId: string, n?: number): Promise<ConversationEntry[]>;
export declare function clearConversation(learnerId: string): Promise<void>;
export declare function pruneOldConversations(): Promise<void>;
export {};
//# sourceMappingURL=conversation.d.ts.map
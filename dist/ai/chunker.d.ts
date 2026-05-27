export interface Chunk {
    text: string;
    lang: string;
    phase: string;
    topic: string;
    chunkIndex: number;
}
export interface ChunkConfig {
    chunkSize: number;
    overlap: number;
}
export declare function chunkDocument(exp: string, code: string, lang: string, phase: string, topic: string, config?: ChunkConfig): Chunk[];
export declare function chunkAllCurriculum(docs: {
    lang: string;
    phase: string;
    topic: string;
    exp: string;
    code: string;
}[], config?: ChunkConfig): Chunk[];
export declare function formatChunksAsContext(chunks: Chunk[], maxChars?: number): string;
//# sourceMappingURL=chunker.d.ts.map
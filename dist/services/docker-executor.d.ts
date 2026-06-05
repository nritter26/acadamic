export interface DockerExecResult {
    output: string;
    error?: boolean;
    dockerAvailable?: boolean;
}
export declare function isDockerAvailable(): boolean;
export declare function getSupportedDockerLangs(): string[];
export declare function initWarmPool(): Promise<void>;
export declare function shutdownWarmPool(): Promise<void>;
export declare function dockerExecute(lang: string, code: string, stdin?: string, onChunk?: (chunk: string) => void): Promise<DockerExecResult>;
export declare function generateDockerfiles(targetDir: string): void;
//# sourceMappingURL=docker-executor.d.ts.map
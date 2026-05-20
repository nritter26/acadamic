export declare function isValidProxyUrl(urlStr: string): boolean;
export interface ProxyResult {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    displayBody: string;
    time: number;
    size: number;
    error?: string;
}
export declare function proxyRequest(method: string, url: string, reqHeaders: Record<string, string>, body?: string): Promise<ProxyResult>;
//# sourceMappingURL=proxy.d.ts.map
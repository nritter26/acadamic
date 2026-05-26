interface InitResult {
    available: boolean;
    reason?: string;
    error?: string;
}
interface ExecResult {
    output: string;
    error?: boolean;
}
declare function executeSQLite(sql: string): ExecResult;
declare function executePG(sql: string): Promise<ExecResult>;
declare function executeMySQL(sql: string): Promise<ExecResult>;
interface DBState {
    sqlite: InitResult | null;
    pg: InitResult | null;
    mysql: InitResult | null;
}
declare function initAll(): DBState;
declare function getStatus(): DBState;
export { initAll, getStatus, executeSQLite, executePG, executeMySQL, };
export type { ExecResult, InitResult };
//# sourceMappingURL=database.d.ts.map
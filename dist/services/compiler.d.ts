import type { CompilerEntry } from '../types';
export declare function checkCompilers(): Promise<Record<string, CompilerEntry>>;
export declare function getCompileHint(lang: string): string;
export declare function getCompilerList(): Record<string, [string, string]>;
//# sourceMappingURL=compiler.d.ts.map
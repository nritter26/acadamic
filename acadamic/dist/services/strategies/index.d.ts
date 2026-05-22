import type { TutorStrategy } from './types';
export declare function executeStrategies(ctx: Parameters<TutorStrategy['canHandle']>[0], sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
export type { TutorStrategy, TutorContext } from './types';
//# sourceMappingURL=index.d.ts.map
import type { TutorStrategy, TutorContext } from './types';
export declare class KeywordMatchStrategy implements TutorStrategy {
    name: string;
    priority: number;
    canHandle(_ctx: TutorContext): Promise<boolean>;
    handle(ctx: TutorContext, sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
}
//# sourceMappingURL=keyword-match-strategy.d.ts.map
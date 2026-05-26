import type { TutorStrategy, TutorContext } from './types';
export declare class SemanticSearchStrategy implements TutorStrategy {
    name: string;
    priority: number;
    canHandle(): Promise<boolean>;
    handle(ctx: TutorContext, sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
}
//# sourceMappingURL=semantic-search-strategy.d.ts.map
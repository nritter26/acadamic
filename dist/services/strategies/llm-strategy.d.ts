import type { TutorStrategy, TutorContext } from './types';
export declare class LLMStrategy implements TutorStrategy {
    name: string;
    priority: number;
    canHandle(): Promise<boolean>;
    handle(ctx: TutorContext, sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
}
//# sourceMappingURL=llm-strategy.d.ts.map
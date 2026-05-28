import type { TutorStrategy, TutorContext } from './types';
export declare class SocraticStrategy implements TutorStrategy {
    name: string;
    priority: number;
    canHandle(ctx: TutorContext): Promise<boolean>;
    handle(ctx: TutorContext, sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
}
//# sourceMappingURL=socratic-strategy.d.ts.map
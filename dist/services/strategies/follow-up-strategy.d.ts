import type { TutorStrategy, TutorContext } from './types';
export declare class FollowUpStrategy implements TutorStrategy {
    name: string;
    priority: number;
    canHandle(ctx: TutorContext): Promise<boolean>;
    handle(ctx: TutorContext, sseSend: (chunk: string) => void, sseDone: () => void): Promise<boolean>;
}
//# sourceMappingURL=follow-up-strategy.d.ts.map
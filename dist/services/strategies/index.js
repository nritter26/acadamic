import { LLMStrategy } from './llm-strategy';
import { ErrorHelpStrategy } from './error-help-strategy';
import { FollowUpStrategy } from './follow-up-strategy';
import { SemanticSearchStrategy } from './semantic-search-strategy';
import { KeywordMatchStrategy } from './keyword-match-strategy';
import { GreetingStrategy } from './greeting-strategy';
import { SocraticStrategy } from './socratic-strategy';
const STRATEGIES = [
    new LLMStrategy(),
    new ErrorHelpStrategy(),
    new FollowUpStrategy(),
    new SemanticSearchStrategy(),
    new KeywordMatchStrategy(),
    new GreetingStrategy(),
    new SocraticStrategy(),
].sort((a, b) => b.priority - a.priority);
export async function executeStrategies(ctx, sseSend, sseDone) {
    for (const strategy of STRATEGIES) {
        if (await strategy.canHandle(ctx)) {
            const handled = await strategy.handle(ctx, sseSend, sseDone);
            if (handled)
                return true;
        }
    }
    return false;
}
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeStrategies = executeStrategies;
const llm_strategy_1 = require("./llm-strategy");
const error_help_strategy_1 = require("./error-help-strategy");
const follow_up_strategy_1 = require("./follow-up-strategy");
const semantic_search_strategy_1 = require("./semantic-search-strategy");
const keyword_match_strategy_1 = require("./keyword-match-strategy");
const greeting_strategy_1 = require("./greeting-strategy");
const socratic_strategy_1 = require("./socratic-strategy");
const STRATEGIES = [
    new llm_strategy_1.LLMStrategy(),
    new error_help_strategy_1.ErrorHelpStrategy(),
    new follow_up_strategy_1.FollowUpStrategy(),
    new semantic_search_strategy_1.SemanticSearchStrategy(),
    new keyword_match_strategy_1.KeywordMatchStrategy(),
    new greeting_strategy_1.GreetingStrategy(),
    new socratic_strategy_1.SocraticStrategy(),
].sort((a, b) => b.priority - a.priority);
async function executeStrategies(ctx, sseSend, sseDone) {
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
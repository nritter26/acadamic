declare var AI_TUTOR_RESPONSES: Array<{keywords: string[], response: string}>;

(function (root: Record<string, unknown>) {
  root.aiTutorResponses = AI_TUTOR_RESPONSES;
})(typeof self !== 'undefined' ? self : this);

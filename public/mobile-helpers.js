(function () {
    'use strict';

    function loadFirstPlatformTopic(lang) {
        const data = courseData['mobile'];
        if (!data) return;
        const prefix = lang === 'android' ? 'Android:' : 'iOS:';
        for (const phase of Object.keys(data)) {
            if (!phase.startsWith(prefix)) continue;
            const topics = Object.keys(data[phase]);
            if (topics.length > 0) {
                loadTopic(phase, topics[0]);
                return;
            }
        }
    }

    window.loadFirstPlatformTopic = loadFirstPlatformTopic;
})();

(function () {
    'use strict';

    var CARDS = [
        { mode: 'js', icon: '&lt;/&gt;', title: 'JavaScript', desc: 'Core lessons and topic explorer' },
        { mode: 'dblab', icon: '<span style="color:#2DD4BF">&#x2B41;</span>', title: 'DB Lab', desc: 'Design tables and draw relations' },
        { mode: 'git', icon: '<span style="color:#f1502f">&#x2318;</span>', title: 'Git Grounds', desc: 'Visualize branch and merge flow' },
        { mode: 'challenge', icon: '<span style="color:#a855f7">&#x270E;</span>', title: 'Code Lab', desc: 'Fix bugs and solve challenges' },
        { mode: 'quiz', icon: '<span style="color:#f59e0b">&#x2605;</span>', title: 'Quiz', desc: 'Practice questions by language' },
        { mode: 'compiler', icon: '<span style="color:#a5f3fc">&#x25B6;</span>', title: 'Compiler', desc: 'Run pipelines across languages' },
    ];

    function createLandingOverlay() {
        if (document.querySelector('.landing-overlay')) return;

        var overlay = document.createElement('div');
        overlay.className = 'landing-overlay';

        var cardsHtml = '';
        for (var i = 0; i < CARDS.length; i++) {
            var c = CARDS[i];
            cardsHtml += '<button class="landing-quick-card" data-mode="' + c.mode + '">' +
                '<span class="landing-card-icon">' + c.icon + '</span>' +
                '<span class="landing-card-title">' + c.title + '</span>' +
                '<span class="landing-card-desc">' + c.desc + '</span>' +
                '</button>';
        }

        overlay.innerHTML =
            '<div class="landing-container">' +
                '<div class="landing-logo">' +
                    '<span class="landing-logo-bracket">&lt;</span>' +
                    '<span class="landing-logo-text">Kodex\'s Lab</span>' +
                    '<span class="landing-logo-bracket">/&gt;</span>' +
                    '<span class="landing-logo-cursor">|</span>' +
                '</div>' +
                '<div class="landing-tagline">Interactive Programming Textbook</div>' +
                '<div class="landing-stats">' +
                    '<div class="landing-stat"><span class="landing-stat-num">50+</span><span class="landing-stat-label">Languages</span></div>' +
                    '<div class="landing-stat"><span class="landing-stat-num">2,100+</span><span class="landing-stat-label">Challenges</span></div>' +
                    '<div class="landing-stat"><span class="landing-stat-num">3,500+</span><span class="landing-stat-label">Topics</span></div>' +
                    '<div class="landing-stat"><span class="landing-stat-num">16</span><span class="landing-stat-label">Mini-Games</span></div>' +
                    '<div class="landing-stat"><span class="landing-stat-num">Live</span><span class="landing-stat-label">Execution</span></div>' +
                    '<div class="landing-stat"><span class="landing-stat-num">AI</span><span class="landing-stat-label">Tutor</span></div>' +
                '</div>' +
                '<div class="landing-quick-grid">' + cardsHtml + '</div>' +
                '<button class="landing-cta" id="landingCta">Launch Lab</button>' +
                '<div class="landing-footer">Just code <span class="cyber-dash">&mdash;</span> don\'t overthink</div>' +
            '</div>';

        document.body.appendChild(overlay);

        requestAnimationFrame(function () {
            overlay.classList.add('landing-ready');
        });

        var qCards = overlay.querySelectorAll('.landing-quick-card');
        for (var j = 0; j < qCards.length; j++) {
            qCards[j].addEventListener('click', function () {
                var mode = this.getAttribute('data-mode');
                if (mode && window.setMode) window.setMode(mode);
                dismissOverlay();
            });
        }

        document.getElementById('landingCta').addEventListener('click', dismissOverlay);
    }

    function dismissOverlay() {
        var overlay = document.querySelector('.landing-overlay');
        if (!overlay || overlay.classList.contains('landing-exit')) return;
        overlay.classList.add('landing-exit');
        var appEl = document.getElementById('app');
        if (appEl) {
            appEl.classList.remove('hide-workspace');
            appEl.classList.add('workspace-open');
        }
        setTimeout(function () {
            if (overlay.parentNode) overlay.remove();
        }, 400);
    }

    function showLandingState() {
        var appEl = document.getElementById('app');
        var headerTitle = document.getElementById('header-title');

        if (appEl) {
            appEl.className = 'js-mode';
            appEl.classList.add('hide-workspace');
            appEl.classList.remove('workspace-open');
        }
        if (headerTitle) headerTitle.textContent = 'WELCOME';

        document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });

        var topicList = document.getElementById('topic-list');
        var explanation = document.getElementById('explanation');
        var editor = document.getElementById('editor');
        var output = document.getElementById('output');
        var levelBar = document.getElementById('level-bar');
        var engineBar = document.getElementById('engine-bar');
        var platformBar = document.getElementById('platform-bar');
        var tutorialProgress = document.getElementById('tutorial-progress');

        if (topicList) topicList.innerHTML = '<div style="color:#475569;font-size:11px;padding:20px;text-align:center;">Select a language to begin</div>';
        if (explanation) explanation.innerHTML = '<div style="color:#475569;font-size:11px;padding:30px 10px;text-align:center;">Pick a language from the left rail or jump into a tool from the landing page.</div>';
        if (editor) editor.value = '// Select a language or mode to begin';
        if (output) output.innerText = '// Welcome to Kodex\'s Lab';
        if (levelBar) levelBar.style.display = 'none';
        if (engineBar) engineBar.style.display = 'none';
        if (platformBar) platformBar.style.display = 'none';
        if (tutorialProgress) tutorialProgress.style.display = 'none';

        createLandingOverlay();
    }

    window.showLandingState = showLandingState;
    showLandingState();
})();

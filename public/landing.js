(function () {
    'use strict';

    function showLandingState() {
        const appEl = document.getElementById('app');
        const headerTitle = document.getElementById('header-title');
        const topicList = document.getElementById('topic-list');
        const explanation = document.getElementById('explanation');
        const editor = document.getElementById('editor');
        const output = document.getElementById('output');
        const levelBar = document.getElementById('level-bar');
        const engineBar = document.getElementById('engine-bar');
        const platformBar = document.getElementById('platform-bar');
        const tutorialProgress = document.getElementById('tutorial-progress');

        if (appEl) {
            appEl.className = 'js-mode';
            appEl.classList.add('hide-workspace');
            appEl.classList.remove('workspace-open');
        }
        if (headerTitle) headerTitle.textContent = 'WELCOME';
        document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));

        if (topicList) {
            topicList.innerHTML = `
                <div class="phase-header" style="cursor:default; pointer-events:none;">
                    <span class="phase-toggle">▶</span>
                    <span class="phase-label-text">Start Here</span>
                </div>
                <div class="item-btn active-topic" style="cursor:default; transform:none; border-left:3px solid var(--accent);">
                    Pick a language on the left to load its lessons, exercises, and tools.
                </div>
                <div class="item-btn" style="cursor:default; transform:none;">
                    DB Lab, Git Grounds, Quiz, and Code Lab all open from the top tabs.
                </div>
            `;
        }
        if (explanation) {
            explanation.innerHTML = `
                <div class="landing-panel">
                    <div class="landing-hero">
                        <div class="landing-badge">Start here</div>
                        <h2>Welcome to Kodex's Lab</h2>
                        <p>
                            Pick a language from the left rail or jump straight into a tool from the cards below.
                            The editor, explanation pane, and output console will follow your choice.
                        </p>
                    </div>
                    <div class="landing-quick-grid">
                        <button class="landing-quick-card" onclick="setMode('js')">
                            <span class="landing-card-icon">&lt;/&gt;</span>
                            <span class="landing-card-title">JavaScript</span>
                            <span class="landing-card-desc">Core lessons and topic explorer</span>
                        </button>
                        <button class="landing-quick-card" onclick="setMode('dblab')">
                            <span class="landing-card-icon">⛁</span>
                            <span class="landing-card-title">DB Lab</span>
                            <span class="landing-card-desc">Design tables and draw relations</span>
                        </button>
                        <button class="landing-quick-card" onclick="setMode('git')">
                            <span class="landing-card-icon">⌘</span>
                            <span class="landing-card-title">Git Grounds</span>
                            <span class="landing-card-desc">Visualize branch and merge flow</span>
                        </button>
                        <button class="landing-quick-card" onclick="setMode('challenge')">
                            <span class="landing-card-icon">✎</span>
                            <span class="landing-card-title">Code Lab</span>
                            <span class="landing-card-desc">Fix bugs and solve challenges</span>
                        </button>
                        <button class="landing-quick-card" onclick="setMode('quiz')">
                            <span class="landing-card-icon">★</span>
                            <span class="landing-card-title">Quiz</span>
                            <span class="landing-card-desc">Practice questions by language</span>
                        </button>
                        <button class="landing-quick-card" onclick="setMode('compiler')">
                            <span class="landing-card-icon">▶</span>
                            <span class="landing-card-title">Compiler</span>
                            <span class="landing-card-desc">Run pipelines across languages</span>
                        </button>
                    </div>
                    <div class="landing-tip">
                        Tip: use the top tabs for broader tools, or the left rail to switch languages quickly.
                    </div>
                </div>
            `;
        }
        if (editor) editor.value = '// Select a language or mode to begin';
        if (output) output.innerText = '// Welcome to Kodex\'s Lab';
        if (levelBar) levelBar.style.display = 'none';
        if (engineBar) engineBar.style.display = 'none';
        if (platformBar) platformBar.style.display = 'none';
        if (tutorialProgress) tutorialProgress.style.display = 'none';
    }

    window.showLandingState = showLandingState;
    showLandingState();
})();

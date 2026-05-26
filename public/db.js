let dbProvider = 'pg'// dbProviderNames extracted to content/app-data.json
// dbProviderColors extracted to content/app-data.json

function initDatabase() {
    currentLevel = 'all';
    document.getElementById('app').className = 'db-mode';
    document.getElementById('header-title').innerText = 'DATABASE';
    document.getElementById('level-bar').style.display = 'none';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-db').classList.add('active');
    switchDBProvider('pg');
}

function switchDBProvider(provider) {
    dbProvider = provider;
    currentLang = provider;
    const rBtn = document.getElementById('roadmap-btn');
    if (rBtn) rBtn.title = 'View ' + (dbProviderNames[provider] || provider) + ' Roadmap';
    if (!courseData[provider]) {
        document.getElementById('topic-list').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div>';
        document.getElementById('explanation').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line"></div>';
        document.getElementById('editor').value = '';
        document.getElementById('output').innerText = '// Loading...';
        loadLangData(provider, function () {
            renderDBTopics();
            loadDBIntro(provider);
        });
        return;
    }
    renderDBTopics();
    loadDBIntro(provider);
}

function loadDBIntro(provider) {
    const intro = langIntro[provider];
    if (!intro) {
        loadFirstTopic(provider);
        return;
    }
    const displayName = dbProviderNames[provider] || provider;
    const color = dbProviderColors[provider] || 'var(--accent)';
    document.getElementById('explanation').innerHTML = `
        <div class="techstack-intro">
            <div class="techstack-intro-header">
                <img class="techstack-intro-logo" src="public/logos/${provider}.svg"
                     alt="${displayName}" style="border-color:${color};"
                     onerror="this.style.display='none'">
                <h2>${displayName}</h2>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it?</h3>
                <p>${intro.what}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it used for?</h3>
                <p>${intro.usedFor}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>Who created it?</h3>
                <p>${intro.creator}</p>
            </div>
        </div>
    `;
    document.getElementById('editor').value = intro.code;
    updateHighlight();
    document.getElementById('output').innerText = '// ' + displayName + ' — explore the topics below to start learning';
}

function loadFirstTopic(provider) {
    const langData = courseData[provider];
    if (langData) {
        const phases = Object.keys(langData);
        if (phases.length > 0) {
            const firstPhase = phases[0];
            const topics = Object.keys(langData[firstPhase]);
            if (topics.length > 0) {
                loadTopic(firstPhase, topics[0]);
                return;
            }
        }
    }
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;padding:20px;text-align:center;font-size:11px;">Select a database provider and topic</div>';
    document.getElementById('editor').value = '';
    updateHighlight();
    document.getElementById('output').innerText = '// Select a database provider and topic';
}

function renderDBTopics() {
    const list = document.getElementById('topic-list');
    let html = `<div class="db-bar">`;
    const dbKeys = Object.keys(dbProviderNames);
    for (const key of dbKeys) {
        const active = key === dbProvider ? ' active' : '';
        const color = dbProviderColors[key] || '#94a3b8';
        html += `<button class="db-btn${active}" onclick="switchDBProvider('${key}')">${dbProviderNames[key]}</button>`;
    }
    html += `</div><div style="height:6px"></div>`;
    html += `<div class="phase-header" onclick="loadDBIntro('${dbProvider}')" style="cursor:pointer;">
        <span class="phase-toggle">▼</span>
        <span class="phase-label-text" style="font-style:italic;">About ${dbProviderNames[dbProvider] || dbProvider}</span>
    </div>`;
    const langData = courseData[currentLang];
    if (langData) {
        for (const phase in langData) {
            html += `<span class="phase-label">${phase}</span>`;
            for (const topic in langData[phase]) {
                const btnId = 'btn-db-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
                html += `<button class="item-btn" id="${btnId}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')">${topic}</button>`;
            }
        }
    } else {
        html += '<div style="color:#64748b;font-size:11px;padding:10px;">No topics yet for this provider</div>';
    }
    list.innerHTML = html;
}

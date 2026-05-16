let dbProvider = 'pg';

const dbProviderNames = {
    pg: 'PostgreSQL', mysql: 'MySQL', sqlite: 'SQLite',
    mongodb: 'MongoDB', firebase: 'Firebase', cloud: 'General Cloud',
};

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
    renderDBTopics();
    loadFirstTopic(provider);
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
        html += `<button class="db-btn${active}" onclick="switchDBProvider('${key}')">${dbProviderNames[key]}</button>`;
    }
    html += `</div><div style="height:6px"></div>`;
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

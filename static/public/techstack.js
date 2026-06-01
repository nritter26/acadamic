let techStackProvider = 'react'// techStackProviderNames extracted to content/app-data.json
// techStackProviderColors extracted to content/app-data.json
// techStackIntro extracted to content/app-data.json

function initTechStack() {
    currentLevel = 'all';
    document.getElementById('app').className = 'techstack-mode';
    document.getElementById('header-title').innerText = 'TECH STACK';
    document.getElementById('level-bar').style.display = 'none';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-techstack').classList.add('active');
    switchTechStackProvider('react');
}

function switchTechStackProvider(provider) {
    techStackProvider = provider;
    currentLang = provider;
    roadmapRendered = false;
    const rBtn = document.getElementById('roadmap-btn');
    if (rBtn) rBtn.title = 'View ' + (techStackProviderNames[provider] || provider) + ' Roadmap';
    if (!courseData[provider]) {
        document.getElementById('topic-list').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div>';
        document.getElementById('explanation').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line"></div>';
        document.getElementById('editor').value = '';
        document.getElementById('output').innerText = '// Loading...';
        loadLangData(provider, function () {
            renderTechStackTopics();
            loadTechStackIntro(provider);
        });
        return;
    }
    renderTechStackTopics();
    loadTechStackIntro(provider);
}

function loadTechStackIntro(provider) {
    const intro = techStackIntro[provider];
    if (!intro) {
        loadFirstTechStackTopic(provider);
        return;
    }

    const displayName = techStackProviderNames[provider] || provider;
    const color = techStackProviderColors[provider] || '#94a3b8';

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
    document.getElementById('output').innerText = `// ${displayName} — explore the topics below to learn more`;
}

function loadFirstTechStackTopic(provider) {
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
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;padding:20px;text-align:center;font-size:11px;">Select a tech stack topic</div>';
    document.getElementById('editor').value = '';
    updateHighlight();
    document.getElementById('output').innerText = '// Select a tech stack topic';
}

function renderTechStackTopics() {
    const list = document.getElementById('topic-list');
    let html = `<div class="techstack-bar">`;
    const tsKeys = Object.keys(techStackProviderNames).sort((a, b) => techStackProviderNames[a].localeCompare(techStackProviderNames[b]));
    for (const key of tsKeys) {
        const active = key === techStackProvider ? ' active' : '';
        const color = techStackProviderColors[key] || '#94a3b8';
        html += `<button class="techstack-btn${active}" onclick="switchTechStackProvider('${key}')">${techStackProviderNames[key]}</button>`;
    }
    html += `</div><div style="height:6px"></div>`;
    const langData = courseData[currentLang];
    if (langData) {
        html += `<div class="phase-header" onclick="loadTechStackIntro('${techStackProvider}')" style="cursor:pointer;">
            <span class="phase-toggle">▼</span>
            <span class="phase-label-text" style="font-style:italic;">About ${techStackProviderNames[techStackProvider] || techStackProvider}</span>
        </div>`;
        for (const phase in langData) {
            html += `<span class="phase-label">${phase}</span>`;
            for (const topic in langData[phase]) {
                const btnId = 'btn-ts-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
                html += `<button class="item-btn" id="${btnId}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')">${topic}</button>`;
            }
        }
    } else {
        html += '<div style="color:#64748b;font-size:11px;padding:10px;">No topics yet for this provider</div>';
    }
    list.innerHTML = html;
}

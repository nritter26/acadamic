let techStackProvider = 'react';

const techStackProviderNames = {
    react: 'React', vue: 'Vue', angular: 'Angular', dk: 'Docker',
    node: 'Node.js', express: 'Express', next: 'Next.js', svelte: 'Svelte',
    tailwind: 'Tailwind', redis: 'Redis', nuxt: 'Nuxt', sveltekit: 'SvelteKit',
    remix: 'Remix', vite: 'Vite', webpack: 'Webpack', graphql: 'GraphQL',
    prisma: 'Prisma', rnative: 'React Native', flutter: 'Flutter',
    cypress: 'Cypress', playwright: 'Playwright', k8s: 'Kubernetes',
    terraform: 'Terraform',
};

const techStackProviderColors = {
    react: '#61DAFB', vue: '#4FC08D', angular: '#DD0031', dk: '#2496ED',
    node: '#339933', express: '#000000', next: '#000000', svelte: '#FF3E00',
    tailwind: '#06B6D4', redis: '#DC382D', nuxt: '#00DC82', sveltekit: '#FF3E00',
    remix: '#121212', vite: '#646CFF', webpack: '#8DD6F9', graphql: '#E10098',
    prisma: '#2D3748', rnative: '#61DAFB', flutter: '#02569B',
    cypress: '#17202C', playwright: '#2EAD33', k8s: '#326CE5',
    terraform: '#7B42BC',
};

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
    if (!courseData[provider]) {
        document.getElementById('topic-list').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div>';
        document.getElementById('explanation').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line"></div>';
        document.getElementById('editor').value = '';
        document.getElementById('output').innerText = '// Loading...';
        loadLangData(provider, function () {
            renderTechStackTopics();
            loadFirstTechStackTopic(provider);
        });
        return;
    }
    renderTechStackTopics();
    loadFirstTechStackTopic(provider);
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
    const tsKeys = Object.keys(techStackProviderNames);
    for (const key of tsKeys) {
        const active = key === techStackProvider ? ' active' : '';
        const color = techStackProviderColors[key] || '#94a3b8';
        html += `<button class="techstack-btn${active}" onclick="switchTechStackProvider('${key}')">${techStackProviderNames[key]}</button>`;
    }
    html += `</div><div style="height:6px"></div>`;
    const langData = courseData[currentLang];
    if (langData) {
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

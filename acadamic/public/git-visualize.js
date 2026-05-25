let gitState = null;
let currentScenario = 'branch';
let gitCommitIdCounter = 0;
let terminalHistory = [];
let terminalIndex = -1;
let tutorialActive = false;
let tutorialStep = 0;
let tutorialSteps = []// GIT_TUTORIAL extracted to content/app-data.json// GIT_SCENARIOS extracted to content/app-data.json// BRANCH_COLORS extracted to content/app-data.json
const BRANCH_COLOR_MAP = {};

function getBranchColor(name) {
    if (!BRANCH_COLOR_MAP[name]) {
        const idx = Object.keys(BRANCH_COLOR_MAP).length % BRANCH_COLORS.length;
        BRANCH_COLOR_MAP[name] = BRANCH_COLORS[idx];
    }
    return BRANCH_COLOR_MAP[name];
}

function shortHash(id) {
    return id ? id.substring(0, 4) : '????';
}

function genId() {
    gitCommitIdCounter++;
    return gitCommitIdCounter.toString(16).padStart(6, '0') + '000'.substring(0, 3);
}

function initGitVisualize() {
    const appEl = document.getElementById('app');
    appEl.className = 'git-mode';
    currentLang = 'git';
    document.getElementById('header-title').innerText = 'GIT';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-git');
    if (navBtn) navBtn.classList.add('active');
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';
    BRANCH_COLOR_MAP.main = '#f1502f';
    addVisualizeButton();
    if (!courseData['git']) {
        loadLangData('git', function () {
            renderGitTopics();
            loadScenario('branch');
        });
        return;
    }
    renderGitTopics();
    loadScenario('branch');
}

function addVisualizeButton() {
    const target = document.querySelector('.col:first-child label, #topic-list');
    if (!target) return;
    let label = document.querySelector('.col:first-child label');
    if (!label) return;
    if (!document.getElementById('viz-btn')) {
        const visualizeBtn = document.createElement('button');
        visualizeBtn.id = 'viz-btn';
        visualizeBtn.className = 'roadmap-btn';
        visualizeBtn.textContent = 'Visualize';
        visualizeBtn.title = 'Open interactive git graph';
        visualizeBtn.style.cssText = 'margin-left:4px;';
        visualizeBtn.onclick = function () {
            const exp = document.getElementById('explanation');
            if (exp && exp.querySelector('svg')) return;
            if (gitState) {
                document.getElementById('explanation').innerHTML = '';
                renderGitGraph();
            } else {
                loadScenario(currentScenario || 'branch');
            }
        };
        label.appendChild(visualizeBtn);
    }
    if (!document.getElementById('tutorial-btn')) {
        const tutBtn = document.createElement('button');
        tutBtn.id = 'tutorial-btn';
        tutBtn.className = 'roadmap-btn';
        tutBtn.textContent = 'Tutorial';
        tutBtn.title = 'Start guided tutorial';
        tutBtn.style.cssText = 'margin-left:4px;';
        tutBtn.onclick = function () { startTutorial(currentScenario); };
        label.appendChild(tutBtn);
    }
}

function renderGitTopics() {
    const list = document.getElementById('topic-list');
    const langData = courseData['git'];
    if (!langData) { list.innerHTML = '<div style="color:#64748b;font-size:11px;padding:10px;">Loading topics...</div>'; return; }
    const collapsed = new Set();
    let html = '<div style="padding:4px 0;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Curriculum</div>';
    for (const phase in langData) {
        const topics = Object.keys(langData[phase]);
        const phaseKey = phase.replace(/\s/g, '');
        const isCollapsed = collapsed.has(phaseKey);
        html += `<div class="phase-header ${isCollapsed ? 'collapsed' : ''}" data-phase="${phaseKey}" onclick="togglePhase('${phaseKey}','${phase.replace(/'/g, "\\'")}')"><span class="phase-toggle">${isCollapsed ? '▶' : '▼'}</span><span class="phase-label-text">${phase}</span><span class="phase-count">${topics.length}</span></div>`;
        html += `<div class="${isCollapsed ? 'phase-collapsed' : ''}">`;
        for (const topic of topics) {
            html += `<button class="item-btn topic-btn-enter" data-phase="${phaseKey}" onclick="loadGitTopic('${phase.replace(/'/g, "\\'")}','${topic.replace(/'/g, "\\'")}')"><span class="topic-name">${topic}</span></button>`;
        }
        html += `</div>`;
    }
    list.innerHTML = html;
}

function loadGitTopic(phase, topic) {
    const langData = courseData['git'];
    if (!langData || !langData[phase] || !langData[phase][topic]) return;
    const item = langData[phase][topic];
    document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active-topic'));
    const btnId = 'btn-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
    const btn = document.getElementById(btnId);
    if (btn) { btn.classList.add('active-topic'); btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    const container = document.getElementById('explanation');
    const backBtn = `<button onclick="showGitGraph()" style="background:var(--accent);color:#000;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:800;margin-bottom:8px;">← Back to Graph</button>`;
    container.innerHTML = backBtn + `<h3>${topic}</h3><div style="font-size:10px;color:#64748b;margin-bottom:8px;">${phase}</div><div style="font-size:12px;line-height:1.7;color:#cbd5e1;">${item.exp || item[0]}</div><pre style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:12px;margin-top:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;">${item.code || item[1] || ''}</pre>`;
    document.getElementById('output').innerText = '// Viewing: ' + topic;
}

function showGitGraph() {
    if (!gitState) { loadScenario(currentScenario || 'branch'); return; }
    document.getElementById('explanation').innerHTML = '';
    renderGitGraph();
}

function loadScenario(name, fromTutorial) {
    const s = GIT_SCENARIOS[name];
    if (!s) return;
    if (tutorialActive && !fromTutorial) closeTutorial();
    currentScenario = name;
    gitState = JSON.parse(JSON.stringify(s.initialState));
    document.getElementById('explanation').innerHTML = '';
    showGitGraph();
    const output = document.getElementById('output');
    if (output) output.innerText = '// Scenario: ' + s.name + '\n// ' + s.desc;
}

function processGitCommand(input) {
    if (!gitState) return '// No repo loaded. Click a scenario first.';
    input = input.trim();
    if (!input) return '';
    const tokens = input.split(/\s+/);
    if (tokens[0] !== 'git') return '// Unknown command. Use "git <command>"';
    const cmd = tokens[1];
    const args = tokens.slice(2);
    try {
        let result = '';
        switch (cmd) {
            case 'init': result = gitInit(); break;
            case 'commit': result = gitCommit(args); break;
            case 'branch': result = gitBranch(args); break;
            case 'checkout': result = gitCheckout(args); break;
            case 'switch': result = gitSwitch(args); break;
            case 'restore': result = gitRestore(args); break;
            case 'merge': result = gitMerge(args); break;
            case 'rebase': result = gitRebase(args); break;
            case 'cherry-pick': result = gitCherryPick(args); break;
            case 'log': result = gitLog(args); break;
            case 'status': result = gitStatus(); break;
            case 'diff': result = gitDiff(args); break;
            case 'reset': result = gitReset(args); break;
            case 'revert': result = gitRevert(args); break;
            case 'tag': result = gitTag(args); break;
            case 'stash': result = gitStash(args); break;
            case 'help': result = helpText(); break;
            default: result = '// Unknown git command: ' + cmd + '\n// Try: init, commit, branch, checkout, switch, restore, merge, rebase, cherry-pick, log, status, diff, reset, revert, tag, stash';
        }
        updateGraph();
        return result;
    } catch (e) {
        return '// Error: ' + e.message;
    }
}

function gitInit() {
    const id = genId();
    gitState = {
        commits: [{ id: id, msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } }],
        branches: { main: id },
        HEAD: 'main', tags: {}, detached: false, stash: []
    };
    return '// Initialized empty Git repository';
}

function gitCommit(args) {
    let msg = '';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-m') { msg = args.slice(i + 1).join(' ').replace(/^["']|["']$/g, ''); break; }
    }
    if (!msg) msg = 'commit ' + (gitState.commits.length + 1);
    const branch = gitState.detached ? 'HEAD' : gitState.HEAD;
    const parentId = gitState.branches[branch] || (gitState.detached ? gitState.detached : null);
    if (!parentId) return '// No parent commit. Use git init first.';
    const id = genId();
    gitState.commits.push({
        id, msg, parents: [parentId], branch: gitState.detached ? 'HEAD' : gitState.HEAD,
        author: 'You', diff: { files: [{ file: 'file.txt', added: ['// ' + msg], removed: [] }] }
    });
    if (!gitState.detached) gitState.branches[gitState.HEAD] = id;
    else gitState.detached = id;
    return '// [' + id + '] ' + msg;
}

function gitBranch(args) {
    if (args.length === 0) {
        return Object.keys(gitState.branches).map(b => '  ' + (b === gitState.HEAD ? '* ' : '  ') + b).join('\n');
    }
    if (args[0] === '-d' || args[0] === '-D') {
        const name = args[1];
        if (!name) return '// error: branch name required';
        if (name === 'main') return '// error: cannot delete main branch';
        if (!gitState.branches[name]) return '// error: branch "' + name + '" not found';
        delete gitState.branches[name];
        const newBranchMap = {};
        for (const k of Object.keys(BRANCH_COLOR_MAP)) {
            if (k !== name) newBranchMap[k] = BRANCH_COLOR_MAP[k];
        }
        for (const k of Object.keys(newBranchMap)) BRANCH_COLOR_MAP[k] = newBranchMap[k];
        if (BRANCH_COLOR_MAP[name]) delete BRANCH_COLOR_MAP[name];
        return '// Deleted branch ' + name;
    }
    if (args[0] === '-m') {
        const oldName = args[1], newName = args[2];
        if (!oldName || !newName) return '// error: git branch -m <old> <new>';
        if (!gitState.branches[oldName]) return '// error: branch "' + oldName + '" not found';
        const commitId = gitState.branches[oldName];
        delete gitState.branches[oldName];
        gitState.branches[newName] = commitId;
        if (gitState.HEAD === oldName) gitState.HEAD = newName;
        if (BRANCH_COLOR_MAP[oldName]) { BRANCH_COLOR_MAP[newName] = BRANCH_COLOR_MAP[oldName]; delete BRANCH_COLOR_MAP[oldName]; }
        return '// Renamed branch ' + oldName + ' to ' + newName;
    }
    const name = args[0];
    if (gitState.branches[name]) return '// error: branch "' + name + '" already exists';
    const currentId = gitState.detached || gitState.branches[gitState.HEAD];
    gitState.branches[name] = currentId;
    return '// Created branch "' + name + '" at ' + shortHash(currentId);
}

function gitCheckout(args) {
    if (args.length === 0) return '// error: git checkout <branch> or git checkout -b <branch>';
    if (args[0] === '-b') {
        const name = args[1];
        if (!name) return '// error: branch name required';
        gitState.branches[name] = gitState.detached || gitState.branches[gitState.HEAD];
        gitState.HEAD = name;
        gitState.detached = false;
        return '// Switched to new branch "' + name + '"';
    }
    const target = args[0];
    if (gitState.branches[target]) {
        gitState.HEAD = target;
        gitState.detached = false;
        return '// Switched to branch "' + target + '"';
    }
    const commit = gitState.commits.find(c => c.id === target || c.id.startsWith(target));
    if (commit) {
        gitState.detached = commit.id;
        return '// HEAD is now at ' + shortHash(commit.id) + ' ' + commit.msg;
    }
    return '// error: pathspec "' + target + '" did not match any file(s) known to git';
}

function gitSwitch(args) {
    if (args.length === 0) return '// error: git switch <branch> or git switch -c <branch>';
    if (args[0] === '-c') return gitCheckout(['-b', args[1]]);
    return gitCheckout([args[0]]);
}

function gitRestore(args) {
    return '// Working directory changes are not tracked in this simulator.\n// Use checkout or switch to move between commits.';
}

function gitMerge(args) {
    let isSquash = false;
    let targetBranch = args[0];
    if (targetBranch === '--squash') {
        isSquash = true;
        targetBranch = args[1];
    }
    if (!targetBranch) return '// error: git merge <branch>';
    if (!gitState.branches[targetBranch]) return '// error: branch "' + targetBranch + '" not found';
    if (gitState.detached) return '// error: cannot merge in detached HEAD';
    if (targetBranch === gitState.HEAD) return '// Already up to date.';
    const headId = gitState.branches[gitState.HEAD];
    const targetId = gitState.branches[targetBranch];
    function isAncestor(ancestorId, descendantId) {
        if (ancestorId === descendantId) return true;
        const c = gitState.commits.find(x => x.id === descendantId);
        if (!c) return false;
        return c.parents.some(p => isAncestor(ancestorId, p));
    }
    if (isAncestor(targetId, headId)) return '// Already up to date.';
    if (isSquash) {
        gitState._squashStaged = true;
        return '// Squash merge — all feature commits staged. Now run: git commit -m "msg"';
    }
    const id = genId();
    gitState.commits.push({
        id, msg: 'Merge branch ' + targetBranch + ' into ' + gitState.HEAD,
        parents: [headId, targetId], branch: gitState.HEAD, author: 'You',
        diff: { files: [{ file: 'merged.txt', added: ['// Merged ' + targetBranch], removed: [] }] }
    });
    gitState.branches[gitState.HEAD] = id;
    return '// Merge made by the \'recursive\' strategy.\n// [' + id + '] Merge branch ' + targetBranch + ' into ' + gitState.HEAD;
}

function gitRebase(args) {
    const onto = args[0];
    if (!onto) return '// error: git rebase <branch>';
    if (!gitState.branches[onto] && onto !== 'main') return '// error: branch "' + onto + '" not found';
    if (gitState.detached) return '// error: cannot rebase in detached HEAD';
    if (onto === gitState.HEAD) return '// Current branch is up to date.';
    const ontoId = gitState.branches[onto];
    const headId = gitState.branches[gitState.HEAD];
    function getAncestors(id) {
        const result = [id];
        const c = gitState.commits.find(x => x.id === id);
        if (c) for (const p of c.parents) result.push(...getAncestors(p));
        return result;
    }
    const headAncestors = getAncestors(headId);
    const ontoAncestors = getAncestors(ontoId);
    const commonAncestor = headAncestors.find(h => ontoAncestors.includes(h));
    const branchCommits = [];
    let current = headId;
    while (current && current !== commonAncestor) {
        const c = gitState.commits.find(x => x.id === current);
        if (c && c.branch === gitState.HEAD) branchCommits.unshift(c);
        if (c && c.parents.length > 0) current = c.parents[0];
        else break;
    }
    if (branchCommits.length === 0) return '// Nothing to rebase.';
    const oldHead = gitState.branches[gitState.HEAD];
    for (const c of branchCommits) {
        const newId = genId();
        const newParent = gitState.branches[gitState.HEAD];
        const clone = JSON.parse(JSON.stringify(c));
        clone.id = newId;
        clone.parents = [newParent];
        clone.diff = { files: [{ file: 'rebased.txt', added: ['// ' + c.msg + ' (rebased)'], removed: [] }] };
        gitState.commits.splice(gitState.commits.indexOf(c), 1, clone);
        gitState.branches[gitState.HEAD] = newId;
    }
    return '// Successfully rebased ' + branchCommits.length + ' commit(s) onto ' + onto;
}

function gitCherryPick(args) {
    const targetId = args[0];
    if (!targetId) return '// error: git cherry-pick <commit-id>';
    const sourceCommit = gitState.commits.find(c => c.id === targetId || c.id.startsWith(targetId));
    if (!sourceCommit) return '// error: commit "' + targetId + '" not found';
    const currentId = gitState.detached || gitState.branches[gitState.HEAD];
    const newId = genId();
    gitState.commits.push({
        id: newId, msg: sourceCommit.msg + ' (cherry-picked)',
        parents: [currentId], branch: gitState.detached ? 'HEAD' : gitState.HEAD,
        author: 'You',
        diff: { files: sourceCommit.diff.files.map(f => ({ ...f, added: f.added.map(l => l + ' (cherry)'), removed: [] })) }
    });
    if (gitState.detached) gitState.detached = newId;
    else gitState.branches[gitState.HEAD] = newId;
    return '// [' + newId + '] ' + sourceCommit.msg + ' (cherry-picked)';
}

function gitLog(args) {
    const branch = gitState.detached ? gitState.detached : gitState.branches[gitState.HEAD];
    const logLines = [];
    function collectLog(id, depth) {
        const c = gitState.commits.find(x => x.id === id);
        if (!c || logLines.some(l => l.includes(c.id))) return;
        const prefix = '  '.repeat(depth) + '* ';
        logLines.push(prefix + shortHash(c.id) + ' ' + c.msg);
        for (const p of c.parents) collectLog(p, depth + 1);
    }
    collectLog(branch, 0);
    return logLines.join('\n') || '(no commits)';
}

function gitStatus() {
    const branch = gitState.detached ? 'HEAD detached at ' + shortHash(gitState.detached) : gitState.HEAD;
    const lines = ['// On branch ' + branch];
    const total = gitState.commits.length;
    lines.push('// ' + total + ' commit(s)');
    lines.push('// Branches: ' + Object.keys(gitState.branches).join(', '));
    if (gitState.stash && gitState.stash.length > 0) lines.push('// Stash: ' + gitState.stash.length + ' entries');
    if (gitState.tags && Object.keys(gitState.tags).length > 0) {
        lines.push('// Tags: ' + Object.entries(gitState.tags).map(([k, v]) => k + '@' + shortHash(v)).join(', '));
    }
    return lines.join('\n');
}

function gitDiff(args) {
    let targetCommit;
    if (args.length > 0) {
        targetCommit = gitState.commits.find(c => c.id.startsWith(args[0]));
    } else {
        const currentId = gitState.detached || gitState.branches[gitState.HEAD];
        targetCommit = gitState.commits.find(c => c.id === currentId);
    }
    if (!targetCommit || !targetCommit.diff) return '(no diff)';
    const lines = [];
    for (const f of targetCommit.diff.files) {
        lines.push('diff --git a/' + f.file + ' b/' + f.file);
        for (const l of f.added) lines.push('+' + l);
        for (const l of f.removed) lines.push('-' + l);
    }
    return lines.join('\n') || '(empty diff)';
}

function gitReset(args) {
    const mode = args[0] || '--mixed';
    const ref = mode.startsWith('--') ? args[1] : args[0];
    const resetMode = mode.startsWith('--') ? mode : '--mixed';
    if (!ref) return '// error: git reset ' + resetMode + ' <commit-id>';
    const target = gitState.commits.find(c => c.id.startsWith(ref));
    if (!target) return '// error: commit "' + ref + '" not found';
    if (resetMode === '--hard') {
        if (gitState.detached) gitState.detached = target.id;
        else gitState.branches[gitState.HEAD] = target.id;
        return '// HEAD is now at ' + shortHash(target.id) + ' ' + target.msg;
    }
    if (resetMode === '--soft') {
        if (gitState.detached) gitState.detached = target.id;
        else gitState.branches[gitState.HEAD] = target.id;
        return '// HEAD moved to ' + shortHash(target.id) + ' (soft reset, changes staged)';
    }
    if (gitState.detached) gitState.detached = target.id;
    else gitState.branches[gitState.HEAD] = target.id;
    return '// HEAD moved to ' + shortHash(target.id) + ' (mixed reset, changes unstaged)';
}

function gitRevert(args) {
    const ref = args[0];
    if (!ref) return '// error: git revert <commit-id>';
    const target = gitState.commits.find(c => c.id.startsWith(ref));
    if (!target) return '// error: commit "' + ref + '" not found';
    const currentId = gitState.detached || gitState.branches[gitState.HEAD];
    const newId = genId();
    gitState.commits.push({
        id: newId, msg: 'Revert "' + target.msg + '"',
        parents: [currentId], branch: gitState.detached ? 'HEAD' : gitState.HEAD,
        author: 'You',
        diff: { files: [{ file: 'revert.txt', added: ['// Reverted ' + shortHash(target.id)], removed: [] }] }
    });
    if (gitState.detached) gitState.detached = newId;
    else gitState.branches[gitState.HEAD] = newId;
    return '// [' + newId + '] Revert "' + target.msg + '"';
}

function gitTag(args) {
    if (args.length === 0) {
        const tags = Object.keys(gitState.tags || {});
        return tags.length ? tags.join('\n') : '(no tags)';
    }
    const name = args[0];
    if (!gitState.tags) gitState.tags = {};
    const currentId = gitState.detached || gitState.branches[gitState.HEAD];
    gitState.tags[name] = currentId;
    return '// Created tag "' + name + '" at ' + shortHash(currentId);
}

function gitStash(args) {
    const sub = args[0];
    if (!sub || sub === 'push') {
        if (!gitState.stash) gitState.stash = [];
        const id = genId();
        gitState.stash.push({ id, msg: args.includes('-m') ? args[args.indexOf('-m') + 1] || 'WIP' : 'WIP on ' + gitState.HEAD });
        return '// Saved working directory and index state On ' + gitState.HEAD + ': ' + id;
    }
    if (sub === 'pop') {
        if (!gitState.stash || gitState.stash.length === 0) return '// No stash entries found.';
        const entry = gitState.stash.pop();
        return '// Dropped ' + entry.id + ' (' + entry.msg + ')';
    }
    if (sub === 'list') {
        if (!gitState.stash || gitState.stash.length === 0) return '// No stash entries.';
        return gitState.stash.map((e, i) => 'stash@{' + i + '}: ' + e.msg).join('\n');
    }
    return '// Unknown stash subcommand: ' + sub;
}

function helpText() {
    return '// Git commands:\n//   init, commit -m "msg", branch, branch <name>,\n//   branch -d <name>, checkout <branch>, checkout -b <name>,\n//   switch <branch>, switch -c <branch>, restore,\n//   merge <branch>, rebase <branch>, cherry-pick <id>,\n//   log --oneline, status, diff, reset --hard <id>,\n//   revert <id>, tag <name>, stash, stash pop';
}

function computeLayout(state) {
    const layout = { nodes: {}, edges: [], maxDepth: 0, branchLanes: {} };
    const branchList = Object.keys(state.branches).sort();
    branchList.forEach((b, i) => layout.branchLanes[b] = i);
    const depths = {};
    const visited = new Set();
    function computeDepth(id) {
        if (depths[id] !== undefined) return depths[id];
        if (visited.has(id)) return 0;
        visited.add(id);
        const c = state.commits.find(x => x.id === id);
        if (!c || c.parents.length === 0) { depths[id] = 0; return 0; }
        depths[id] = Math.max(...c.parents.map(computeDepth)) + 1;
        return depths[id];
    }
    for (const c of state.commits) computeDepth(c.id);
    const H_SPACING = 110, V_SPACING = 80, MARGIN_X = 70, MARGIN_Y = 50;
    for (const c of state.commits) {
        const lane = layout.branchLanes[c.branch] !== undefined ? layout.branchLanes[c.branch] : Object.keys(layout.branchLanes).length;
        const d = depths[c.id] || 0;
        if (d > layout.maxDepth) layout.maxDepth = d;
        layout.nodes[c.id] = { x: d * H_SPACING + MARGIN_X, y: lane * V_SPACING + MARGIN_Y, depth: d, lane };
    }
    for (const c of state.commits) {
        for (const pId of c.parents) {
            const childPos = layout.nodes[c.id];
            const parentPos = layout.nodes[pId];
            if (childPos && parentPos) {
                const midX = (childPos.x + parentPos.x) / 2;
                const path = 'M ' + childPos.x + ' ' + childPos.y + ' C ' + midX + ' ' + childPos.y + ', ' + midX + ' ' + parentPos.y + ', ' + parentPos.x + ' ' + parentPos.y;
                layout.edges.push({ from: pId, to: c.id, path });
            }
        }
    }
    const totalLanes = branchList.length || 1;
    layout.width = (layout.maxDepth + 2) * H_SPACING + MARGIN_X * 2;
    layout.height = totalLanes * V_SPACING + MARGIN_Y * 2;
    return layout;
}

function generateSVG(state, layout, existingIds) {
    const BRANCH_COLORS_PALETTE = { main: '#f1502f', feature: '#2ea043', develop: '#d29922', fix: '#8250df', hotfix: '#db61a2', HEAD: '#94a3b8' };
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + layout.width + ' ' + (layout.height + 100) + '" style="width:100%;height:auto;display:block;">';
    svg += '<defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg += '<filter id="pulseGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg += '<marker id="gitArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#334155"/></marker></defs>';
    svg += '<rect width="100%" height="100%" fill="#020617" rx="8"/>';
    if (state.commits.length === 0) {
        svg += '<text x="' + (layout.width / 2) + '" y="70" fill="#64748b" font-size="12" text-anchor="middle">Type <tspan fill="#a5f3fc" font-weight="700">git init</tspan> to start</text>';
        svg += '</svg>';
        return svg;
    }
    const branchList = Object.keys(state.branches).sort();
    let labelY = 25;
    for (const b of branchList) {
        const color = BRANCH_COLORS_PALETTE[b] || '#64748b';
        const isHead = !state.detached && b === state.HEAD;
        const isNew = !existingIds || !existingIds.has('branch:' + b);
        const cls = ' class="git-branch-label' + (isNew ? ' animate-in"' : ' visible"');
        svg += '<g' + cls + '><rect x="15" y="' + (labelY - 7) + '" width="12" height="12" rx="3" fill="' + color + '"/>';
        svg += '<text x="32" y="' + (labelY + 4) + '" fill="' + (isHead ? '#f1f5f9' : '#94a3b8') + '" font-size="9" font-weight="' + (isHead ? '800' : '500') + '">' + b + (isHead ? ' ← HEAD' : '') + '</text></g>';
        labelY += 16;
    }
    if (state.detached) {
        svg += '<rect x="15" y="' + (labelY - 7) + '" width="12" height="12" rx="3" fill="#94a3b8"/>';
        svg += '<text x="32" y="' + (labelY + 4) + '" fill="#f1f5f9" font-size="9" font-weight="800">HEAD detached at ' + shortHash(state.detached) + '</text>';
    }
    for (const edge of layout.edges) {
        const isNew = !existingIds || !existingIds.has('edge:' + edge.from + '-' + edge.to);
        const cls = ' class="git-edge' + (isNew ? ' animate-in"' : ' visible"');
        svg += '<path d="' + edge.path + '" fill="none" stroke="#334155" stroke-width="2" marker-end="url(#gitArrow)"' + cls + ' data-from="' + edge.from + '" data-to="' + edge.to + '"/>';
    }
    const visualCommitOrder = [];
    const commitSet = new Set();
    function traverse(id) {
        if (commitSet.has(id)) return;
        commitSet.add(id);
        const c = state.commits.find(x => x.id === id);
        if (c) { for (const p of c.parents) traverse(p); visualCommitOrder.push(c); }
    }
    for (const b of branchList) traverse(state.branches[b]);
    if (state.detached && !commitSet.has(state.detached)) traverse(state.detached);
    for (const c of state.commits) { if (!commitSet.has(c.id)) visualCommitOrder.push(c); }
    for (let idx = 0; idx < visualCommitOrder.length; idx++) {
        const commit = visualCommitOrder[idx];
        const pos = layout.nodes[commit.id];
        if (!pos) continue;
        const color = BRANCH_COLORS_PALETTE[commit.branch] || '#64748b';
        const isNew = !existingIds || !existingIds.has(commit.id);
        const parentCount = commit.parents.length;
        const depth = pos.depth || 0;
        const delay = (depth * 0.08) + 's';
        const cls = 'git-commit-node' + (isNew ? ' animate-in' : ' visible') + (parentCount > 1 ? ' merge-commit' : '');
        svg += '<g class="' + cls + '" data-id="' + commit.id + '" data-depth="' + depth + '" style="animation-delay:' + delay + '; cursor:pointer;" onclick="handleCommitClick(\'' + commit.id + '\')" onmouseenter="handleCommitHover(\'' + commit.id + '\')" onmouseleave="handleCommitUnhover()">';
        svg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="' + (parentCount > 1 ? 18 : 16) + '" fill="#0f172a" stroke="' + color + '" stroke-width="2.5" class="git-commit-circle"/>';
        svg += '<text x="' + pos.x + '" y="' + (pos.y + 1) + '" fill="#f1f5f9" font-size="7" text-anchor="middle" dominant-baseline="central" font-weight="700" font-family="monospace">' + shortHash(commit.id) + '</text>';
        svg += '<text x="' + (pos.x + 30) + '" y="' + (pos.y + 14) + '" fill="#cbd5e1" font-size="8" dominant-baseline="central">' + commit.msg.substring(0, 35) + '</text>';
        svg += '</g>';
        if (state.tags) {
            for (const [tagName, tagId] of Object.entries(state.tags)) {
                if (tagId === commit.id) {
                    svg += '<g><rect x="' + (pos.x + 30) + '" y="' + (pos.y + 9) + '" width="' + (tagName.length * 7 + 10) + '" height="12" rx="3" fill="#d29922"/><text x="' + (pos.x + 35) + '" y="' + (pos.y + 15) + '" fill="#000" font-size="6" font-weight="800">' + tagName + '</text></g>';
                }
            }
        }
    }
    svg += '</svg>';
    return svg;
}

function renderGitGraph() {
    if (!gitState) return;
    const state = gitState;
    const layout = computeLayout(state);
    const container = document.getElementById('explanation');
    const scKeys = ['branch', 'merge', 'rebase', 'squash', 'cherrypick', 'freeplay'];
    let html = '<div class="gitviz-tabs">';
    for (const k of scKeys) {
        const active = k === currentScenario ? ' active' : '';
        html += `<button class="gitviz-tab${active}" onclick="if(typeof closeTutorial==='function')closeTutorial();loadScenario('${k}')">${GIT_SCENARIOS[k].name}</button>`;
    }
    html += '</div>';
    html += generateSVG(state, layout);
    html += '<div class="gitviz-terminal" id="gitvizTerminal"><div class="gitviz-terminal-output" id="gitvizTerminalOutput">';
    html += '<div class="gitviz-terminal-line"><span class="gitviz-prompt">$ </span>echo "Welcome to Git Mode"</div>';
    html += '<div class="gitviz-terminal-line gitviz-terminal-result">Welcome to Git Mode</div>';
    html += '<div class="gitviz-terminal-line gitviz-terminal-result">✓ Scenario: ' + (GIT_SCENARIOS[currentScenario] ? GIT_SCENARIOS[currentScenario].name : 'Freeplay') + ' — ' + (GIT_SCENARIOS[currentScenario] ? GIT_SCENARIOS[currentScenario].desc : 'Practice freely!') + '</div>';
    html += '</div>';
    html += '<div class="gitviz-terminal-input-line"><span class="gitviz-prompt">$ </span><input type="text" id="gitvizTerminalInput" class="gitviz-terminal-input" autofocus placeholder="Type a git command..." spellcheck="false" autocomplete="off"></div></div>';
    html += '<div id="gitCommitDetail" style="display:none;"></div>';
    if (tutorialActive) {
        html += renderTutorialPanel();
    }
    container.innerHTML = html;
    setTimeout(() => {
        const inp = document.getElementById('gitvizTerminalInput');
        if (inp) { inp.addEventListener('keydown', handleTerminalKeydown); inp.focus(); }
    }, 10);
}

function updateGraph() {
    if (!gitState) return;
    const existingIds = new Set();
    document.querySelectorAll('.git-commit-node[data-id]').forEach(el => existingIds.add(el.getAttribute('data-id')));
    document.querySelectorAll('.git-branch-label').forEach(el => existingIds.add('branch:' + (el.textContent || '').trim().replace(' ← HEAD', '')));
    document.querySelectorAll('.git-edge').forEach(el => existingIds.add('edge:' + (el.getAttribute('data-from') || '') + '-' + (el.getAttribute('data-to') || '')));
    const state = gitState;
    const layout = computeLayout(state);
    const svgString = generateSVG(state, layout, existingIds);
    const oldSvg = document.querySelector('#explanation svg');
    if (!oldSvg) { renderGitGraph(); return; }
    const temp = document.createElement('div');
    temp.innerHTML = svgString;
    const newSvg = temp.firstChild;
    oldSvg.parentNode.replaceChild(newSvg, oldSvg);
}

function handleCommitClick(commitId) {
    if (!gitState) return;
    const commit = gitState.commits.find(c => c.id === commitId);
    if (!commit) return;
    document.querySelectorAll('.git-commit-circle').forEach(c => c.style.filter = '');
    const circles = document.querySelectorAll('.git-commit-node[data-id="' + commitId + '"] circle');
    circles.forEach(c => c.style.filter = 'url(#glow)');
    const detail = document.getElementById('gitCommitDetail');
    if (!detail) return;
    detail.style.display = 'block';
    let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<span style="font-weight:800;color:#f1f5f9;">' + commit.id + '</span>';
    html += '<span style="font-size:10px;color:#64748b;">' + commit.author + ' · branch: ' + commit.branch + '</span></div>';
    html += '<div style="font-size:12px;color:#cbd5e1;margin-bottom:8px;padding:6px 10px;background:#1e293b;border-radius:4px;">' + commit.msg + '</div>';
    if (commit.parents.length > 0) {
        html += '<div style="font-size:9px;color:#64748b;margin-bottom:8px;">Parents: ' + commit.parents.join(', ') + '</div>';
    }
    if (commit.diff && commit.diff.files.length > 0) {
        html += '<div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Files changed</div>';
        for (const f of commit.diff.files) {
            html += '<div style="padding:4px 6px;margin-bottom:4px;background:#1e293b;border-radius:4px;">';
            html += '<div style="font-size:9px;font-weight:600;color:#cbd5e1;margin-bottom:2px;">' + f.file + '</div>';
            for (const l of f.added) html += '<div style="font-size:10px;color:#2ea043;font-family:monospace;padding:1px 0;">+ ' + l + '</div>';
            for (const l of f.removed) html += '<div style="font-size:10px;color:#f1502f;font-family:monospace;padding:1px 0;">- ' + l + '</div>';
            html += '</div>';
        }
    }
    detail.innerHTML = html;
}

function handleCommitHover(commitId) {
    const circles = document.querySelectorAll('.git-commit-node[data-id="' + commitId + '"] circle:first-child');
    circles.forEach(c => c.setAttribute('r', '20'));
}

function handleCommitUnhover() {
    document.querySelectorAll('.git-commit-circle').forEach(c => {
        const node = c.closest('.git-commit-node');
        const isMerge = node?.classList.contains('merge-commit');
        c.setAttribute('r', isMerge ? '18' : '16');
    });
}

/* ── Terminal ── */

function appendToTerminal(text, isResult) {
    const out = document.getElementById('gitvizTerminalOutput');
    if (!out) return;
    const line = document.createElement('div');
    line.className = 'gitviz-terminal-line' + (isResult ? ' gitviz-terminal-result' : '');
    line.innerHTML = (isResult ? '' : '<span class="gitviz-prompt">$ </span>') + text.replace(/\n/g, '<br>');
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
}

function handleTerminalKeydown(e) {
    if (e.key === 'Enter') {
        const inp = e.target;
        const cmd = inp.value.trim();
        if (!cmd) return;
        terminalHistory.push(cmd);
        terminalIndex = terminalHistory.length;
        inp.value = '';
        var out;
        if (cmd.startsWith('git ')) {
            const result = processGitCommand(cmd);
            // processGitCommand re-renders the graph, so we get a fresh terminal. Append cmd+result.
            out = document.getElementById('gitvizTerminalOutput');
            if (out) {
                out.innerHTML += '<div class="gitviz-terminal-line"><span class="gitviz-prompt">$ </span>' + escHtml(cmd) + '</div>';
                out.innerHTML += '<div class="gitviz-terminal-line gitviz-terminal-result">' + result.replace(/\n/g, '<br>') + '</div>';
                out.scrollTop = out.scrollHeight;
            }
            if (tutorialActive) {
                const step = tutorialSteps[tutorialStep];
                if (step && !step.waitForUser && step.cmd === cmd) {
                    setTimeout(nextTutorialStep, 600);
                }
            }
            const detail = document.getElementById('gitCommitDetail');
            if (detail) detail.style.display = 'none';
        } else {
            out = document.getElementById('gitvizTerminalOutput');
            if (out) {
                out.innerHTML += '<div class="gitviz-terminal-line"><span class="gitviz-prompt">$ </span>' + escHtml(cmd) + '</div>';
                out.innerHTML += '<div class="gitviz-terminal-line gitviz-terminal-result">// Unknown command. Use "git &lt;command&gt;"</div>';
                out.scrollTop = out.scrollHeight;
            }
        }
        setTimeout(() => {
            const inp2 = document.getElementById('gitvizTerminalInput');
            if (inp2) inp2.focus();
        }, 50);
    } else if (e.key === 'ArrowUp') {
        if (terminalIndex > 0) {
            terminalIndex--;
            e.target.value = terminalHistory[terminalIndex];
        }
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        if (terminalIndex < terminalHistory.length - 1) {
            terminalIndex++;
            e.target.value = terminalHistory[terminalIndex];
        } else {
            terminalIndex = terminalHistory.length;
            e.target.value = '';
        }
        e.preventDefault();
    }
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Tutorial ── */

function renderTutorialPanel() {
    const step = tutorialSteps[tutorialStep];
    if (!step) return '';
    const total = tutorialSteps.length;
    const pct = Math.round(((tutorialStep + 1) / total) * 100);
    let html = '<div class="gitviz-tutorial" id="gitvizTutorial">';
    html += '<div class="gitviz-tutorial-header"><span class="gitviz-tutorial-title">' + step.title + '</span>';
    html += '<button class="gitviz-tutorial-close" onclick="closeTutorial()">&times;</button></div>';
    html += '<div class="gitviz-tutorial-progress"><div class="gitviz-tutorial-progress-bar" style="width:' + pct + '%"></div></div>';
    html += '<div class="gitviz-tutorial-body">' + step.text + '</div>';
    html += '<div class="gitviz-tutorial-footer">';
    if (tutorialStep > 0) html += '<button class="gitviz-tutorial-btn" onclick="prevTutorialStep()">← Back</button>';
    if (step.waitForUser) {
        if (tutorialStep < total - 1) html += '<button class="gitviz-tutorial-btn gitviz-tutorial-btn-primary" onclick="nextTutorialStep()">Next →</button>';
        else html += '<button class="gitviz-tutorial-btn gitviz-tutorial-btn-primary" onclick="closeTutorial()">Finish</button>';
    } else {
        html += '<button class="gitviz-tutorial-btn gitviz-tutorial-btn-primary" onclick="runTutorialStep()">Run Command</button>';
        if (tutorialStep < total - 1) html += '<button class="gitviz-tutorial-btn" onclick="skipTutorialStep()">Skip →</button>';
        else html += '<button class="gitviz-tutorial-btn" onclick="closeTutorial()">Finish</button>';
    }
    html += '</div></div>';
    return html;
}

function updateTutorialUI() {
    const panel = document.getElementById('gitvizTutorial');
    if (panel) {
        panel.outerHTML = renderTutorialPanel();
    } else {
        const detail = document.getElementById('gitCommitDetail');
        if (detail) {
            detail.insertAdjacentHTML('afterend', renderTutorialPanel());
        }
    }
    const inp = document.getElementById('gitvizTerminalInput');
    if (inp) inp.focus();
}

function startTutorial(scenario) {
    tutorialActive = true;
    tutorialStep = 0;
    tutorialSteps = GIT_TUTORIAL[scenario] || GIT_TUTORIAL['branch'];
    loadScenario(scenario || 'branch', true);
}

function nextTutorialStep() {
    if (!tutorialActive) return;
    tutorialStep++;
    if (tutorialStep >= tutorialSteps.length) {
        closeTutorial();
        return;
    }
    const step = tutorialSteps[tutorialStep];
    updateTutorialUI();
    if (!step.waitForUser && step.cmd) {
        setTimeout(function () {
            const inp = document.getElementById('gitvizTerminalInput');
            if (inp) {
                inp.value = step.cmd;
                inp.focus();
                inp.select();
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
                inp.dispatchEvent(enterEvent);
            }
        }, 300);
    }
}

function prevTutorialStep() {
    if (!tutorialActive || tutorialStep <= 0) return;
    tutorialStep--;
    updateTutorialUI();
}

function skipTutorialStep() {
    if (!tutorialActive) return;
    nextTutorialStep();
}

function runTutorialStep() {
    if (!tutorialActive) return;
    const step = tutorialSteps[tutorialStep];
    if (!step || !step.cmd) return;
    const inp = document.getElementById('gitvizTerminalInput');
    if (inp) {
        inp.value = step.cmd;
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        inp.dispatchEvent(enterEvent);
    } else {
        const result = processGitCommand(step.cmd);
        if (result && tutorialActive) {
            setTimeout(nextTutorialStep, 600);
        }
    }
}

function closeTutorial() {
    tutorialActive = false;
    tutorialStep = 0;
    tutorialSteps = [];
    const panel = document.getElementById('gitvizTutorial');
    if (panel) panel.remove();
}


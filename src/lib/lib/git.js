let _idCounter = 0;

function genId() {
  _idCounter++;
  return _idCounter.toString(16).padStart(6, '0') + '000'.substring(0, 3);
}

function shortHash(id) {
  return id ? id.substring(0, 4) : '????';
}

const BRANCH_COLORS = { main: '#f1502f', feature: '#2ea043', develop: '#d29922', fix: '#8250df', hotfix: '#db61a2', HEAD: '#94a3b8' };

export const SCENARIOS = {
  branch: {
    name: 'Branching',
    desc: 'Explore creating and switching branches.',
    initialState: {
      commits: [{ id: genId(), msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } }],
      branches: {},
      HEAD: 'main', tags: {}, detached: false, stash: [],
    },
    initCmds: ['git init'],
  },
  merge: {
    name: 'Merge',
    desc: 'Merge two branches together.',
    initialState: {
      commits: [
        { id: 'a10001', msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } },
        { id: 'a20001', msg: 'Add feature', parents: ['a10001'], branch: 'feature', author: 'You', diff: { files: [{ file: 'feature.txt', added: ['feature work'], removed: [] }] } },
      ],
      branches: { main: 'a10001', feature: 'a20001' },
      HEAD: 'main', tags: {}, detached: false, stash: [],
    },
    initCmds: ['git merge feature'],
  },
  rebase: {
    name: 'Rebase',
    desc: 'Rebase a feature branch onto main.',
    initialState: {
      commits: [
        { id: 'b10001', msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } },
        { id: 'b20001', msg: 'Main update', parents: ['b10001'], branch: 'main', author: 'You', diff: { files: [{ file: 'main.txt', added: ['update'], removed: [] }] } },
        { id: 'b30001', msg: 'Feature work', parents: ['b10001'], branch: 'feature', author: 'You', diff: { files: [{ file: 'feat.txt', added: ['work'], removed: [] }] } },
      ],
      branches: { main: 'b20001', feature: 'b30001' },
      HEAD: 'feature', tags: {}, detached: false, stash: [],
    },
    initCmds: ['git rebase main'],
  },
  squash: {
    name: 'Squash',
    desc: 'Squash merge feature commits into one.',
    initialState: {
      commits: [
        { id: 'c10001', msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } },
        { id: 'c20001', msg: 'Commit 1', parents: ['c10001'], branch: 'feature', author: 'You', diff: { files: [] } },
        { id: 'c30001', msg: 'Commit 2', parents: ['c20001'], branch: 'feature', author: 'You', diff: { files: [] } },
      ],
      branches: { main: 'c10001', feature: 'c30001' },
      HEAD: 'main', tags: {}, detached: false, stash: [],
    },
    initCmds: ['git merge --squash feature', 'git commit -m "Squashed feature"'],
  },
  cherrypick: {
    name: 'Cherry Pick',
    desc: 'Pick specific commits into current branch.',
    initialState: {
      commits: [
        { id: 'd10001', msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } },
        { id: 'd20001', msg: 'Useful fix', parents: ['d10001'], branch: 'fix', author: 'You', diff: { files: [{ file: 'fix.txt', added: ['fix'], removed: [] }] } },
      ],
      branches: { main: 'd10001', fix: 'd20001' },
      HEAD: 'main', tags: {}, detached: false, stash: [],
    },
    initCmds: ['git cherry-pick d20001'],
  },
  freeplay: {
    name: 'Freeplay',
    desc: 'Practice freely!',
    initialState: {
      commits: [{ id: genId(), msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } }],
      branches: {},
      HEAD: 'main', tags: {}, detached: false, stash: [],
    },
    initCmds: [],
  },
};

export function createGitEngine() {
  let _state = null;
  let _history = [];
  let _historyIdx = -1;

  function cloneState() {
    return JSON.parse(JSON.stringify(_state));
  }

  function pushHistory() {
    _history = _history.slice(0, _historyIdx + 1);
    _history.push(cloneState());
    if (_history.length > 30) _history.shift();
    _historyIdx = _history.length - 1;
  }

  function loadScenario(name) {
    const s = SCENARIOS[name];
    if (!s) return false;
    _state = JSON.parse(JSON.stringify(s.initialState));
    pushHistory();
    // fix branch pointers if needed
    if (!_state.branches.main && _state.commits.length > 0) {
      _state.branches.main = _state.commits[0].id;
    }
    return true;
  }

  function getState() { return _state; }
  function canUndo() { return _historyIdx > 0; }
  function canRedo() { return _historyIdx < _history.length - 1; }

  function undo() {
    if (_historyIdx <= 0) return false;
    _historyIdx--;
    _state = JSON.parse(JSON.stringify(_history[_historyIdx]));
    return true;
  }

  function redo() {
    if (_historyIdx >= _history.length - 1) return false;
    _historyIdx++;
    _state = JSON.parse(JSON.stringify(_history[_historyIdx]));
    return true;
  }

  function processCommand(input) {
    if (!_state) return '// No repo loaded. Load a scenario first.';
    const trimmed = input.trim();
    if (!trimmed) return '';
    const tokens = trimmed.split(/\s+/);
    if (tokens[0] !== 'git') return '// Unknown command. Use "git <command>"';
    const cmd = tokens[1];
    const args = tokens.slice(2);
    try {
      let result = '';
      switch (cmd) {
        case 'init': result = doInit(); break;
        case 'commit': result = doCommit(args); break;
        case 'branch': result = doBranch(args); break;
        case 'checkout': result = doCheckout(args); break;
        case 'switch': result = doSwitch(args); break;
        case 'restore': result = '// Working directory changes not tracked in this simulator.'; break;
        case 'merge': result = doMerge(args); break;
        case 'rebase': result = doRebase(args); break;
        case 'cherry-pick': result = doCherryPick(args); break;
        case 'log': result = doLog(); break;
        case 'status': result = doStatus(); break;
        case 'diff': result = doDiff(args); break;
        case 'reset': result = doReset(args); break;
        case 'revert': result = doRevert(args); break;
        case 'tag': result = doTag(args); break;
        case 'stash': result = doStash(args); break;
        case 'help': result = helpText(); break;
        default: result = '// Unknown git command: ' + cmd + '\n// Try: init, commit, branch, checkout, switch, restore, merge, rebase, cherry-pick, log, status, diff, reset, revert, tag, stash';
      }
      return result;
    } catch (e) {
      return '// Error: ' + e.message;
    }
  }

  function doInit() {
    const id = genId();
    _state = {
      commits: [{ id, msg: 'Initial commit', parents: [], branch: 'main', author: 'You', diff: { files: [] } }],
      branches: { main: id },
      HEAD: 'main', tags: {}, detached: false, stash: [],
    };
    return '// Initialized empty Git repository';
  }

  function doCommit(args) {
    let msg = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-m') { msg = args.slice(i + 1).join(' ').replace(/^["']|["']$/g, ''); break; }
    }
    if (!msg) msg = 'commit ' + (_state.commits.length + 1);
    const branch = _state.detached ? 'HEAD' : _state.HEAD;
    const parentId = _state.branches[branch] || _state.detached;
    if (!parentId && _state.commits.length === 0) return '// No commits yet. Use git init first.';
    const effectiveParent = parentId || _state.commits[_state.commits.length - 1]?.id;
    if (!effectiveParent) return '// No parent commit found.';
    const id = genId();
    _state.commits.push({ id, msg, parents: [effectiveParent], branch: _state.detached ? 'HEAD' : _state.HEAD, author: 'You', diff: { files: [{ file: 'file.txt', added: ['// ' + msg], removed: [] }] } });
    if (!_state.detached) _state.branches[_state.HEAD] = id;
    else _state.detached = id;
    return '// [' + id + '] ' + msg;
  }

  function doBranch(args) {
    if (args.length === 0) {
      return Object.keys(_state.branches).map(b => '  ' + (b === _state.HEAD ? '* ' : '  ') + b).join('\n');
    }
    if (args[0] === '-d' || args[0] === '-D') {
      const name = args[1];
      if (!name) return '// error: branch name required';
      if (name === 'main') return '// error: cannot delete main branch';
      if (!_state.branches[name]) return '// error: branch "' + name + '" not found';
      delete _state.branches[name];
      return '// Deleted branch ' + name;
    }
    if (args[0] === '-m') {
      const oldName = args[1], newName = args[2];
      if (!oldName || !newName) return '// error: git branch -m <old> <new>';
      if (!_state.branches[oldName]) return '// error: branch "' + oldName + '" not found';
      _state.branches[newName] = _state.branches[oldName];
      delete _state.branches[oldName];
      if (_state.HEAD === oldName) _state.HEAD = newName;
      return '// Renamed branch ' + oldName + ' to ' + newName;
    }
    const name = args[0];
    if (_state.branches[name]) return '// error: branch "' + name + '" already exists';
    const currentId = _state.detached || _state.branches[_state.HEAD];
    _state.branches[name] = currentId;
    return '// Created branch "' + name + '" at ' + shortHash(currentId);
  }

  function doCheckout(args) {
    if (args.length === 0) return '// error: git checkout <branch> or git checkout -b <branch>';
    if (args[0] === '-b') {
      const name = args[1];
      if (!name) return '// error: branch name required';
      _state.branches[name] = _state.detached || _state.branches[_state.HEAD];
      _state.HEAD = name;
      _state.detached = false;
      return '// Switched to new branch "' + name + '"';
    }
    const target = args[0];
    if (_state.branches[target]) {
      _state.HEAD = target;
      _state.detached = false;
      return '// Switched to branch "' + target + '"';
    }
    const commit = _state.commits.find(c => c.id === target || c.id.startsWith(target));
    if (commit) {
      _state.detached = commit.id;
      return '// HEAD is now at ' + shortHash(commit.id) + ' ' + commit.msg;
    }
    return '// error: pathspec "' + target + '" did not match any file(s) known to git';
  }

  function doSwitch(args) {
    if (args.length === 0) return '// error: git switch <branch> or git switch -c <branch>';
    if (args[0] === '-c') return doCheckout(['-b', args[1]]);
    return doCheckout([args[0]]);
  }

  function doMerge(args) {
    let isSquash = false, targetBranch = args[0];
    if (targetBranch === '--squash') { isSquash = true; targetBranch = args[1]; }
    if (!targetBranch) return '// error: git merge <branch>';
    if (!_state.branches[targetBranch]) return '// error: branch "' + targetBranch + '" not found';
    if (_state.detached) return '// error: cannot merge in detached HEAD';
    if (targetBranch === _state.HEAD) return '// Already up to date.';
    const headId = _state.branches[_state.HEAD];
    const targetId = _state.branches[targetBranch];
    function isAncestor(a, d) {
      if (a === d) return true;
      const c = _state.commits.find(x => x.id === d);
      return c && c.parents.some(p => isAncestor(a, p));
    }
    if (isAncestor(targetId, headId)) return '// Already up to date.';
    if (isSquash) { _state._squashStaged = true; return '// Squash merge — all feature commits staged. Now run: git commit -m "msg"'; }
    const id = genId();
    _state.commits.push({ id, msg: 'Merge branch ' + targetBranch + ' into ' + _state.HEAD, parents: [headId, targetId], branch: _state.HEAD, author: 'You', diff: { files: [{ file: 'merged.txt', added: ['// Merged ' + targetBranch], removed: [] }] } });
    _state.branches[_state.HEAD] = id;
    return '// Merge made by the \'recursive\' strategy.\n// [' + id + '] Merge branch ' + targetBranch + ' into ' + _state.HEAD;
  }

  function doRebase(args) {
    const onto = args[0];
    if (!onto) return '// error: git rebase <branch>';
    if (!_state.branches[onto] && onto !== 'main') return '// error: branch "' + onto + '" not found';
    if (_state.detached) return '// error: cannot rebase in detached HEAD';
    if (onto === _state.HEAD) return '// Current branch is up to date.';
    const ontoId = _state.branches[onto], headId = _state.branches[_state.HEAD];
    function getAncestors(id) {
      const result = [id];
      const c = _state.commits.find(x => x.id === id);
      if (c) for (const p of c.parents) result.push(...getAncestors(p));
      return result;
    }
    const ha = getAncestors(headId), oa = getAncestors(ontoId);
    const common = ha.find(h => oa.includes(h));
    const branchCommits = [];
    let cur = headId;
    while (cur && cur !== common) {
      const c = _state.commits.find(x => x.id === cur);
      if (c && c.branch === _state.HEAD) branchCommits.unshift(c);
      if (c && c.parents.length > 0) cur = c.parents[0];
      else break;
    }
    if (branchCommits.length === 0) return '// Nothing to rebase.';
    for (const c of branchCommits) {
      const newId = genId();
      const newParent = _state.branches[_state.HEAD];
      const clone = JSON.parse(JSON.stringify(c));
      clone.id = newId; clone.parents = [newParent];
      _state.commits.splice(_state.commits.indexOf(c), 1, clone);
      _state.branches[_state.HEAD] = newId;
    }
    return '// Successfully rebased ' + branchCommits.length + ' commit(s) onto ' + onto;
  }

  function doCherryPick(args) {
    const targetId = args[0];
    if (!targetId) return '// error: git cherry-pick <commit-id>';
    const src = _state.commits.find(c => c.id === targetId || c.id.startsWith(targetId));
    if (!src) return '// error: commit "' + targetId + '" not found';
    const currentId = _state.detached || _state.branches[_state.HEAD];
    const id = genId();
    _state.commits.push({ id, msg: src.msg + ' (cherry-picked)', parents: [currentId], branch: _state.detached ? 'HEAD' : _state.HEAD, author: 'You', diff: { files: src.diff.files.map(f => ({ ...f, added: f.added.map(l => l + ' (cherry)'), removed: [] })) } });
    if (_state.detached) _state.detached = id;
    else _state.branches[_state.HEAD] = id;
    return '// [' + id + '] ' + src.msg + ' (cherry-picked)';
  }

  function doLog() {
    const branch = _state.detached || _state.branches[_state.HEAD];
    const lines = [];
    function collect(id, depth) {
      const c = _state.commits.find(x => x.id === id);
      if (!c || lines.some(l => l.includes(c.id))) return;
      lines.push('  '.repeat(depth) + '* ' + shortHash(c.id) + ' ' + c.msg);
      for (const p of c.parents) collect(p, depth + 1);
    }
    collect(branch, 0);
    return lines.join('\n') || '(no commits)';
  }

  function doStatus() {
    const branch = _state.detached ? 'HEAD detached at ' + shortHash(_state.detached) : _state.HEAD;
    const lines = ['// On branch ' + branch, '// ' + _state.commits.length + ' commit(s)', '// Branches: ' + Object.keys(_state.branches).join(', ')];
    if (_state.stash?.length) lines.push('// Stash: ' + _state.stash.length + ' entries');
    if (_state.tags && Object.keys(_state.tags).length) lines.push('// Tags: ' + Object.entries(_state.tags).map(([k, v]) => k + '@' + shortHash(v)).join(', '));
    return lines.join('\n');
  }

  function doDiff(args) {
    const target = args[0] ? _state.commits.find(c => c.id.startsWith(args[0])) : _state.commits.find(c => c.id === (_state.detached || _state.branches[_state.HEAD]));
    if (!target || !target.diff) return '(no diff)';
    return target.diff.files.map(f => 'diff --git a/' + f.file + ' b/' + f.file + '\n' + f.added.map(l => '+' + l).join('\n') + '\n' + f.removed.map(l => '-' + l).join('\n')).join('\n') || '(empty diff)';
  }

  function doReset(args) {
    const mode = args[0]?.startsWith('--') ? args[0] : '--mixed';
    const ref = mode.startsWith('--') ? args[1] : args[0];
    if (!ref) return '// error: git reset ' + mode + ' <commit-id>';
    const target = _state.commits.find(c => c.id.startsWith(ref));
    if (!target) return '// error: commit "' + ref + '" not found';
    if (_state.detached) _state.detached = target.id;
    else _state.branches[_state.HEAD] = target.id;
    return '// HEAD is now at ' + shortHash(target.id) + ' ' + target.msg;
  }

  function doRevert(args) {
    const ref = args[0];
    if (!ref) return '// error: git revert <commit-id>';
    const target = _state.commits.find(c => c.id.startsWith(ref));
    if (!target) return '// error: commit "' + ref + '" not found';
    const currentId = _state.detached || _state.branches[_state.HEAD];
    const id = genId();
    _state.commits.push({ id, msg: 'Revert "' + target.msg + '"', parents: [currentId], branch: _state.detached ? 'HEAD' : _state.HEAD, author: 'You', diff: { files: [{ file: 'revert.txt', added: ['// Reverted ' + shortHash(target.id)], removed: [] }] } });
    if (_state.detached) _state.detached = id;
    else _state.branches[_state.HEAD] = id;
    return '// [' + id + '] Revert "' + target.msg + '"';
  }

  function doTag(args) {
    if (args.length === 0) return Object.keys(_state.tags || {}).length ? Object.keys(_state.tags).join('\n') : '(no tags)';
    const name = args[0];
    if (!_state.tags) _state.tags = {};
    _state.tags[name] = _state.detached || _state.branches[_state.HEAD];
    return '// Created tag "' + name + '" at ' + shortHash(_state.tags[name]);
  }

  function doStash(args) {
    const sub = args[0];
    if (!sub || sub === 'push') {
      if (!_state.stash) _state.stash = [];
      _state.stash.push({ id: genId(), msg: 'WIP on ' + _state.HEAD });
      return '// Saved working directory and index state On ' + _state.HEAD;
    }
    if (sub === 'pop') {
      if (!_state.stash?.length) return '// No stash entries found.';
      _state.stash.pop();
      return '// Dropped stash entry';
    }
    if (sub === 'list') return !_state.stash?.length ? '// No stash entries.' : _state.stash.map((e, i) => 'stash@{' + i + '}: ' + e.msg).join('\n');
    return '// Unknown stash subcommand: ' + sub;
  }

  function helpText() {
    return '// Git commands:\n//   init, commit -m "msg", branch, branch <name>,\n//   branch -d <name>, checkout <branch>, checkout -b <name>,\n//   switch <branch>, switch -c <name>, restore,\n//   merge <branch>, rebase <branch>, cherry-pick <id>,\n//   log --oneline, status, diff, reset --hard <id>,\n//   revert <id>, tag <name>, stash, stash pop';
  }

  function computeLayout(state) {
    if (!state) return null;
    const layout = { nodes: {}, edges: [], maxDepth: 0, width: 400, height: 200 };
    const branchList = Object.keys(state.branches).sort();
    const branchLanes = {};
    branchList.forEach((b, i) => branchLanes[b] = i);
    const depths = {}, visited = new Set();
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
    const HSPACE = 110, VSPACE = 80, MX = 70, MY = 50;
    for (const c of state.commits) {
      const lane = branchLanes[c.branch] !== undefined ? branchLanes[c.branch] : Object.keys(branchLanes).length;
      const d = depths[c.id] || 0;
      if (d > layout.maxDepth) layout.maxDepth = d;
      layout.nodes[c.id] = { x: d * HSPACE + MX, y: lane * VSPACE + MY, depth: d, lane };
    }
    for (const c of state.commits) {
      for (const pId of c.parents) {
        const childPos = layout.nodes[c.id], parentPos = layout.nodes[pId];
        if (childPos && parentPos) {
          const mx = (childPos.x + parentPos.x) / 2;
          layout.edges.push({ from: pId, to: c.id, path: 'M ' + childPos.x + ' ' + childPos.y + ' C ' + mx + ' ' + childPos.y + ', ' + mx + ' ' + parentPos.y + ', ' + parentPos.x + ' ' + parentPos.y });
        }
      }
    }
    layout.width = Math.max((layout.maxDepth + 2) * HSPACE + MX * 2, 500);
    layout.height = Math.max((branchList.length || 1) * VSPACE + MY * 2, 300);
    return layout;
  }

  function generateSVG(state, layout) {
    if (!state || !layout) return '';
    const PALETTE = BRANCH_COLORS;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + layout.width + ' ' + (layout.height + 80) + '" style="width:100%;height:auto;display:block;">';
    svg += '<defs>';
    svg += '<filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg += '<filter id="pulseGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg += '<marker id="gitArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#334155"/></marker>';
    svg += '</defs>';
    svg += '<style>.git-cn{transition:r .15s,filter .2s}.git-cn:hover{filter:url(#glow)}.git-edge{opacity:0;animation:geFadeIn .4s ease forwards}.git-cg{opacity:0;animation:gcFadeIn .35s ease forwards}.visible{opacity:1}@keyframes geFadeIn{from{opacity:0;stroke-dashoffset:50}to{opacity:1;stroke-dashoffset:0}}@keyframes gcFadeIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}</style>';
    svg += '<rect width="100%" height="100%" fill="#020617" rx="8"/>';
    if (state.commits.length === 0) {
      svg += '<text x="' + (layout.width / 2) + '" y="70" fill="#64748b" font-size="12" text-anchor="middle">Type <tspan fill="#a5f3fc" font-weight="700">git init</tspan> to start</text></svg>';
      return svg;
    }
    const branchList = Object.keys(state.branches).sort();
    let ly = 25;
    for (const b of branchList) {
      const color = PALETTE[b] || '#64748b';
      const isHead = !state.detached && b === state.HEAD;
      svg += '<g><rect x="15" y="' + (ly - 7) + '" width="12" height="12" rx="3" fill="' + color + '"/><text x="32" y="' + (ly + 4) + '" fill="' + (isHead ? '#f1f5f9' : '#94a3b8') + '" font-size="9" font-weight="' + (isHead ? '800' : '500') + '">' + b + (isHead ? ' ← HEAD' : '') + '</text></g>';
      ly += 16;
    }
    if (state.detached) {
      svg += '<rect x="15" y="' + (ly - 7) + '" width="12" height="12" rx="3" fill="#94a3b8"/><text x="32" y="' + (ly + 4) + '" fill="#f1f5f9" font-size="9" font-weight="800">HEAD detached at ' + shortHash(state.detached) + '</text>';
    }
    for (const edge of layout.edges) {
      svg += '<path d="' + edge.path + '" fill="none" stroke="#334155" stroke-width="2" marker-end="url(#gitArrow)" class="git-edge visible"/>';
    }
    const vco = [];
    const cs = new Set();
    function traverse(id) {
      if (cs.has(id)) return;
      cs.add(id);
      const c = state.commits.find(x => x.id === id);
      if (c) { for (const p of c.parents) traverse(p); vco.push(c); }
    }
    for (const b of branchList) traverse(state.branches[b]);
    if (state.detached && !cs.has(state.detached)) traverse(state.detached);
    for (const c of state.commits) if (!cs.has(c.id)) vco.push(c);
    for (let idx = 0; idx < vco.length; idx++) {
      const commit = vco[idx], pos = layout.nodes[commit.id];
      if (!pos) continue;
      const color = PALETTE[commit.branch] || '#64748b';
      const isMerge = commit.parents.length > 1;
      const delay = (pos.depth * 0.08) + 's';
      svg += '<g class="git-cg visible" data-id="' + commit.id + '" style="animation-delay:' + delay + ';cursor:pointer;">';
      svg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="' + (isMerge ? 14 : 12) + '" fill="#0f172a" stroke="' + color + '" stroke-width="2.5" class="git-cn"/>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y + 1) + '" fill="#f1f5f9" font-size="6" text-anchor="middle" dominant-baseline="central" font-weight="700" font-family="monospace">' + shortHash(commit.id) + '</text>';
      svg += '<text x="' + (pos.x + 24) + '" y="' + (pos.y + 12) + '" fill="#cbd5e1" font-size="7">' + commit.msg.substring(0, 30) + '</text></g>';
      if (state.tags) {
        for (const [tn, ti] of Object.entries(state.tags)) {
          if (ti === commit.id) {
            svg += '<g><rect x="' + (pos.x + 24) + '" y="' + (pos.y + 7) + '" width="' + (tn.length * 6 + 8) + '" height="10" rx="2" fill="#d29922"/><text x="' + (pos.x + 28) + '" y="' + (pos.y + 12) + '" fill="#000" font-size="5" font-weight="800">' + tn + '</text></g>';
          }
        }
      }
    }
    svg += '</svg>';
    return svg;
  }

  return {
    getState,
    loadScenario,
    processCommand,
    computeLayout: () => computeLayout(_state),
    generateSVG: () => generateSVG(_state, computeLayout(_state)),
    canUndo,
    canRedo,
    undo,
    redo,
    pushHistory,
  };
}

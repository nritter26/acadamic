let _lang = $state('js');
let _phase = $state('');
let _topic = $state('');
let _level = $state('all');
let _completionFilter = $state('all');
let _engineFilter = $state('all');
let _collapsedPhases = $state(new Set());
let _topicData = $state(null);
let _curriculumLoading = $state(false);

export function getCurriculumState() {
  return {
    get lang() { return _lang; },
    set lang(v) { _lang = v; },
    get phase() { return _phase; },
    set phase(v) { _phase = v; },
    get topic() { return _topic; },
    set topic(v) { _topic = v; },
    get level() { return _level; },
    set level(v) { _level = v; },
    get completionFilter() { return _completionFilter; },
    set completionFilter(v) { _completionFilter = v; },
    get engineFilter() { return _engineFilter; },
    set engineFilter(v) { _engineFilter = v; },
    get collapsedPhases() { return _collapsedPhases; },
    get topicData() { return _topicData; },
    get curriculumLoading() { return _curriculumLoading; },

    togglePhase(key) {
      const next = new Set(_collapsedPhases);
      if (next.has(key)) next.delete(key); else next.add(key);
      _collapsedPhases = next;
    },

    async loadLangData(lang) {
      if (_topicData && _topicData[lang]) return;
      _curriculumLoading = true;
      if (typeof courseData !== 'undefined' && courseData[lang]) {
        _topicData = courseData;
        _curriculumLoading = false;
        return;
      }
      const filename = lang === 'rs' ? 'rust' : lang === 'wasm' ? 'wasm' : lang === 'asm' ? 'asm' : lang;
      try {
        const r = await fetch(`/content/${filename}.json`);
        const data = await r.json();
        const cd = _topicData || {};
        cd[lang] = data;
        _topicData = cd;
      } catch (e) {
        console.error('Failed to load curriculum for', lang, e);
      }
      _curriculumLoading = false;
    },
  };
}

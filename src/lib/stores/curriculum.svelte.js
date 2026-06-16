import { getCurrentLang } from '$lib/lib/translate.js';
import { buildSearchIndex } from '$lib/lib/search.js';

let _lang = $state('js');
let _uiLang = $state(getCurrentLang() || 'en');
let _phase = $state('');
let _topic = $state('');
let _level = $state('all');
let _completionFilter = $state('all');
let _engineFilter = $state('all');
let _collapsedPhases = $state(new Set());
let _topicData = $state(null);
let _curriculumLoading = $state(false);
let _loadVersion = 0;

export function getCurriculumState() {
  return {
    get lang() { return _lang; },
    set lang(v) { _lang = v; },
    get uiLang() { return _uiLang; },
    set uiLang(v) {
      if ((v === 'en' || v === 'th') && v !== _uiLang) {
        _uiLang = v;
        if (_topicData && _lang && _topicData[_lang]) {
          const next = { ..._topicData };
          delete next[_lang];
          _topicData = next;
        }
        this.loadLangData(_lang);
      }
    },
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

    collapseAllPhases() {
      if (!_topicData?.[_lang]) return;
      const keys = Object.keys(_topicData[_lang]);
      _collapsedPhases = new Set(keys);
    },

    expandAllPhases() {
      _collapsedPhases = new Set();
    },

    getPhaseNames() {
      return _topicData?.[_lang] ? Object.keys(_topicData[_lang]) : [];
    },

    async loadLangData(lang) {
      if (_topicData && _topicData[lang]) return;
      _loadVersion++;
      const version = _loadVersion;
      _curriculumLoading = true;

      const isThai = _uiLang === 'th';
      let filename;
      const langMap = { rs: 'rust', wasm: 'wasm', asm: 'asm' };
      const baseName = langMap[lang] || lang;
      filename = isThai ? `${baseName}_th` : baseName;

      if (typeof courseData !== 'undefined' && courseData[lang]) {
        _topicData = courseData;
        _curriculumLoading = false;
        buildSearchIndex();
        return;
      }
      try {
        const r = await fetch(`/api/content/${filename}`);
        if (!r.ok) {
          if (isThai) {
            const r2 = await fetch(`/api/content/${baseName}`);
            const res2 = await r2.json();
            if (version !== _loadVersion) return;
            const cd = _topicData || {};
            cd[lang] = res2.data;
            _topicData = cd;
            buildSearchIndex();
          } else {
            console.warn(`Curriculum fetch failed for ${lang} (${r.status})`);
          }
          _curriculumLoading = false;
          return;
        }
        const res = await r.json();
        if (version !== _loadVersion) return;
        const cd = _topicData || {};
        cd[lang] = res.data;
        _topicData = cd;
        buildSearchIndex();
      } catch (e) {
        console.error('Failed to load curriculum for', lang, e);
      }
      if (version === _loadVersion) _curriculumLoading = false;
    },
  };
}

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';

function loadGitScript() {
  const code = fs.readFileSync('./public/git-visualize.js', 'utf8');
  const appData = require('../content/app-data.json');
  const gitData = require('../content/git.json');

  const elements = new Map<string, any>();
  const topicList = { innerHTML: '' };
  const explanation = { innerHTML: '' };
  const output = { innerText: '' };

  const document = {
    getElementById(id: string) {
      return elements.get(id) || null;
    },
    querySelectorAll(selector: string) {
      if (selector === '.item-btn') {
        return Array.from(elements.values()).filter((el: any) => el?.classList?.isItemBtn);
      }
      return [];
    },
    querySelector() {
      return null;
    },
    createElement() {
      return {
        className: '',
        id: '',
        style: {},
        textContent: '',
        title: '',
        onclick: null,
        appendChild() {},
        addEventListener() {},
        setAttribute() {},
        innerHTML: '',
        parentNode: { replaceChild() {} },
      };
    },
    body: { appendChild() {} },
  } as any;

  elements.set('topic-list', topicList);
  elements.set('explanation', explanation);
  elements.set('output', output);

  const context: any = {
    console,
    document,
    window: {},
    currentLang: 'git',
    courseData: { git: gitData },
    GIT_SCENARIOS: appData.GIT_SCENARIOS,
    GIT_TUTORIAL: appData.GIT_TUTORIAL,
    BRANCH_COLORS: appData.BRANCH_COLORS,
    loadLangData() {
      return true;
    },
    updateAISuggestions() {},
    togglePhase() {},
    closeTutorial() {},
    setTimeout(fn: Function) {
      fn();
    },
    clearTimeout() {},
    requestAnimationFrame(fn: Function) {
      fn();
    },
    KeyboardEvent: function () {},
  };

  vm.createContext(context);
  vm.runInContext(code, context);

  return { context, elements, topicList, explanation, output };
}

function makeTopicButton(id: string) {
  const calls: string[] = [];
  return {
    id,
    classList: {
      isItemBtn: true,
      add(cls: string) {
        calls.push(cls);
      },
      remove() {},
    },
    scrollIntoViewCalled: false,
    scrollIntoView() {
      this.scrollIntoViewCalled = true;
    },
    calls,
  };
}

describe('Git Grounds', () => {
  it('renders topic buttons with ids that loadGitTopic can target', () => {
    const { context, topicList } = loadGitScript();
    const phase = Object.keys(context.courseData.git)[0];
    const topic = Object.keys(context.courseData.git[phase])[0];

    context.renderGitTopics();

    const expectedId = context.gitTopicId(phase, topic);
    expect(topicList.innerHTML).toContain(`id="${expectedId}"`);
  });

  it('highlights the selected topic button', () => {
    const { context, elements, explanation, output } = loadGitScript();
    const phase = Object.keys(context.courseData.git)[0];
    const topic = Object.keys(context.courseData.git[phase])[0];
    const btnId = context.gitTopicId(phase, topic);
    const btn = makeTopicButton(btnId);

    elements.set(btnId, btn);

    context.renderGitTopics();
    context.loadGitTopic(phase, topic);

    expect(btn.calls).toContain('active-topic');
    expect(btn.scrollIntoViewCalled).toBe(true);
    expect(explanation.innerHTML).toContain(topic);
    expect(output.innerText).toContain(topic);
  });
});

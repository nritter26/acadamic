import { writable, derived } from 'svelte/store';
import { api } from '../api';

interface CourseData {
  [phase: string]: {
    [topic: string]: {
      exp: string;
      code?: string;
    };
  };
}

interface ContentState {
  courses: string[];
  currentCourse: string | null;
  data: CourseData | null;
  loading: boolean;
  error: string | null;
}

export const contentStore = writable<ContentState>({
  courses: [],
  currentCourse: null,
  data: null,
  loading: false,
  error: null,
});

export const courses = derived(contentStore, ($c) => $c.courses);
export const courseData = derived(contentStore, ($c) => $c.data);
export const contentLoading = derived(contentStore, ($c) => $c.loading);

export async function loadCourses() {
  contentStore.update((s) => ({ ...s, loading: true }));
  try {
    const list = await api.courses();
    contentStore.update((s) => ({
      ...s,
      courses: list,
      currentCourse: list[0] || null,
      loading: false,
    }));
  } catch (err) {
    contentStore.update((s) => ({
      ...s,
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load courses',
    }));
  }
}

export async function loadCourseData(courseName: string) {
  contentStore.update((s) => ({ ...s, loading: true, currentCourse: courseName }));
  try {
    const res = await fetch(`/content/${courseName}`);
    const data: CourseData = await res.json();
    contentStore.update((s) => ({ ...s, data, loading: false }));
  } catch (err) {
    contentStore.update((s) => ({
      ...s,
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load course',
    }));
  }
}

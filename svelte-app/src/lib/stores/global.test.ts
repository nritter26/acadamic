import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { globalStore, theme, sidebarOpen, setTheme, toggleSidebar } from './global';

describe('globalStore', () => {
  it('has default dark theme', () => {
    expect(get(theme)).toBe('dark');
  });

  it('setTheme updates theme', () => {
    setTheme('light');
    expect(get(theme)).toBe('light');
    setTheme('dark');
    expect(get(theme)).toBe('dark');
  });

  it('toggleSidebar flips sidebarOpen', () => {
    const before = get(sidebarOpen);
    toggleSidebar();
    expect(get(sidebarOpen)).toBe(!before);
  });
});

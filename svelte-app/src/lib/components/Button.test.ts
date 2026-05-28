import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

function text(text: string) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

describe('Button', () => {
  it('renders with children', () => {
    const { getByText } = render(Button, { children: text('Click me') });
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onclick when clicked', async () => {
    let clicked = false;
    const { container } = render(Button, {
      onclick: () => { clicked = true; },
      children: text('Click'),
    });
    const btn = container.querySelector('button')!;
    await fireEvent.click(btn);
    expect(clicked).toBe(true);
  });

  it('applies disabled state', () => {
    const { container } = render(Button, {
      disabled: true,
      children: text('Disabled'),
    });
    expect(container.querySelector('button')!.disabled).toBe(true);
  });
});

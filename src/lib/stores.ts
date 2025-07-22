import { writable } from 'svelte/store';
import type { Theme, MarkdownFile } from './types';

export const markdownStore = writable<string>('');
export const filesStore = writable<MarkdownFile[]>([]);
export const themeStore = writable<Theme>('minimal');
export const tocEnabledStore = writable<boolean>(false);
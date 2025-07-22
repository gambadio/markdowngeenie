export type Theme = 'minimal' | 'elegant';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface MarkdownFile {
  name: string;
  size: number;
  content: string;
}
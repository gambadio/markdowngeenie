import { describe, it, expect, vi } from 'vitest';
import { convertMarkdownToDocx } from './converter';

// Mock html-docx-js
vi.mock('html-docx-js/dist/html-docx', () => ({
  asBlob: vi.fn().mockResolvedValue(new Blob(['mock docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
}));

// Mock DOM methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn().mockReturnValue('mock-url'),
    revokeObjectURL: vi.fn()
  }
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn().mockReturnValue({
    click: vi.fn(),
    href: '',
    download: ''
  })
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn()
});

describe('convertMarkdownToDocx', () => {
  it('should convert basic markdown to docx', async () => {
    const markdown = '# Hello World\n\nThis is a test.';
    
    await expect(convertMarkdownToDocx(markdown, 'minimal', false)).resolves.not.toThrow();
  });

  it('should handle TOC generation', async () => {
    const markdown = '# Main Title\n\n## Section 1\n\n### Subsection';
    
    await expect(convertMarkdownToDocx(markdown, 'elegant', true)).resolves.not.toThrow();
  });

  it('should handle empty markdown', async () => {
    const markdown = '';
    
    await expect(convertMarkdownToDocx(markdown, 'minimal', false)).resolves.not.toThrow();
  });
});
</testing>
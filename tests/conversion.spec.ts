import { test, expect } from '@playwright/test';

test.describe('Markdown to Word Conversion', () => {
  test('should convert markdown to docx', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Markdown → Word/);
    
    // Enter markdown content
    const markdown = '# Test Document\n\nThis is a **test** document with *formatting*.';
    await page.fill('textarea', markdown);
    
    // Click convert button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Convert → DOCX")');
    
    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('my-document.docx');
  });

  test('should enable TOC option', async ({ page }) => {
    await page.goto('/');
    
    // Check TOC checkbox
    await page.check('input[type="checkbox"]#toc-enabled');
    expect(await page.isChecked('#toc-enabled')).toBe(true);
  });

  test('should switch themes', async ({ page }) => {
    await page.goto('/');
    
    // Switch to elegant theme
    await page.check('input[value="elegant"]');
    
    // Verify theme is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'elegant');
  });

  test('should handle file upload', async ({ page }) => {
    await page.goto('/');
    
    // Create a test markdown file
    const fileContent = '# Uploaded Document\n\nThis is from a file.';
    
    await page.setInputFiles('input[type="file"]', {
      name: 'test.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(fileContent)
    });
    
    // Verify content is loaded
    await expect(page.locator('textarea')).toHaveValue(expect.stringContaining('Uploaded Document'));
  });
});
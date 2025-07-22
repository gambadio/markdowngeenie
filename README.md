# Markdown → Word

Convert Markdown files to beautifully formatted Word documents instantly. Free, fast, and feature-rich online converter.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the application.

## ✨ Features

- **Drag & Drop**: Upload multiple .md files effortlessly
- **Live Editing**: Paste and edit Markdown in real-time
- **Themes**: Choose between Minimal and Elegant document styles
- **Table of Contents**: Auto-generate navigable TOC
- **Client-Side**: No server uploads, complete privacy
- **Mobile-First**: Responsive design for all devices
- **Accessible**: WCAG compliant with keyboard navigation

## 🎨 Adding Themes

Create new themes by extending `src/app.css`:

```css
/* Custom Theme Variables */
--theme-custom-bg: #your-color;
--theme-custom-text: #your-color;
--theme-custom-heading: #your-color;

[data-theme="custom"] .theme-bg { background-color: var(--theme-custom-bg); }
```

## 🔌 Adding Plugins

Extend markdown-it in `src/lib/utils/converter.ts`:

```typescript
md.use(yourPlugin, { options });
```

## 📈 SEO Checklist

- ✅ Semantic HTML structure
- ✅ Meta descriptions and Open Graph
- ✅ Structured data (JSON-LD)
- ✅ Sitemap generation
- ✅ Mobile optimization
- ✅ Fast loading (< 3s)

**Audit Tools**: [PageSpeed Insights](https://pagespeed.web.dev/) | [Rich Results Test](https://search.google.com/test/rich-results)

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:integration  # E2E tests
npm run check       # Type checking
```
# Luna Blog

A minimal, fast, and elegant static blog powered by Markdown.

No frameworks. No client-side JavaScript. Just HTML, CSS, and your writing.

## ✨ Features

- **Markdown-first** — Write posts as `.md` files with YAML front-matter
- **Syntax highlighting** — Code blocks highlighted at build time via highlight.js
- **Dark mode** — Automatic, based on system preference
- **RSS feed** — Auto-generated at `/rss.xml`
- **SEO-ready** — Open Graph tags, proper heading hierarchy, semantic HTML
- **Fast** — Zero client-side JS, builds in milliseconds
- **Deploy anywhere** — Optimized for Cloudflare Pages

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Preview locally
npm run dev
# → http://localhost:3000
```

## 📝 Writing a New Post

### Option 1: Use the helper script

```bash
npm run new-post "My Post Title"
```

This creates a new file in `posts/` with front-matter template.

### Option 2: Create manually

Create a `.md` file in `posts/` with this format:

```markdown
---
title: "My Post Title"
date: "2025-02-18"
description: "A brief description for SEO and RSS."
tags: ["tag1", "tag2"]
draft: false
---

Your Markdown content here...
```

**Note:** Posts with `draft: true` won't be published.

## 📁 Project Structure

```
luna-blog/
├── posts/              # Your blog posts (Markdown)
├── content/
│   └── about.md        # About page content
├── src/
│   ├── build.js        # Static site generator
│   ├── dev-server.js   # Local development server
│   ├── new-post.js     # Post scaffolding helper
│   └── templates/      # HTML templates
├── static/
│   └── css/
│       └── style.css   # All styles
├── dist/               # Build output (deploy this)
├── site.config.js      # Site configuration
└── package.json
```

## ⚙️ Configuration

Edit `site.config.js` to customize:

```javascript
module.exports = {
  site_name: "Luna",
  author: "Your Name",
  description: "Your blog description",
  url: "https://your-site.pages.dev",
  hero_title: "Hi, I'm Your Name",
  hero_subtitle: "What you write about.",
  github_url: "https://github.com/you",
  twitter_url: "https://twitter.com/you",
};
```

## 🌐 Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create a new project → connect your GitHub repo
4. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy!

Every push to `main` will trigger a new deployment.

## 📄 License

MIT

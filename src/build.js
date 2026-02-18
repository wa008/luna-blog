const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const { marked } = require("marked");

const config = require("../site.config");

marked.setOptions({
    gfm: true,
    breaks: false,
});

// --- Paths ---
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const ABOUT_FILE = path.join(ROOT, "content", "about.md");
const TEMPLATES_DIR = path.join(ROOT, "src", "templates");
const STATIC_DIR = path.join(ROOT, "static");
const DIST_DIR = path.join(ROOT, "dist");

// --- Helpers ---
function readTemplate(name) {
    return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), "utf-8");
}

function renderTemplate(template, vars) {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value || "");
    }
    return result;
}

function calculateReadingTime(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 230));
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function slugify(filename) {
    return filename.replace(/\.md$/, "");
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyDirRecursive(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// --- Parse all posts ---
function getPosts() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.warn("⚠  No posts/ directory found. Creating it...");
        ensureDir(POSTS_DIR);
        return [];
    }

    const files = fs
        .readdirSync(POSTS_DIR)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

    return files.map((file) => {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
        const { attributes, body } = fm(raw);
        const slug = slugify(file);
        const html = marked.parse(body);
        const readingTime = calculateReadingTime(body);

        return {
            slug,
            title: attributes.title || slug,
            date: attributes.date || "2025-01-01",
            draft: attributes.draft || false,
            body,
            html,
            readingTime,
        };
    });
}

// --- Build Wrappers ---
function wrapInBase(content, vars = {}) {
    const baseTemplate = readTemplate("base");
    return renderTemplate(baseTemplate, {
        ...vars,
        site_name: config.site_name,
        author: config.author,
        year: new Date().getFullYear().toString(),
        content,
    });
}

// --- Build Home Page ---
function buildHomePage(posts) {
    const homeTemplate = readTemplate("home");

    const postListHtml = posts
        .filter((p) => !p.draft)
        .map(
            (p) => `
    <li class="post-item">
      <span class="post-item-date">${formatDateShort(p.date)}</span>
      <a href="/posts/${p.slug}" class="post-item-title">${p.title}</a>
    </li>`
        )
        .join("\n");

    const homeContent = renderTemplate(homeTemplate, {
        hero_title: config.hero_title,
        hero_subtitle: config.hero_subtitle,
        post_list: postListHtml,
    });

    const html = wrapInBase(homeContent, {
        title: `${config.site_name} — ${config.description}`,
        description: config.description,
        og_type: "website",
        url: config.url,
        head: "",
    });

    ensureDir(DIST_DIR);
    fs.writeFileSync(path.join(DIST_DIR, "index.html"), html);
    console.log("  ✓ index.html");
}

// --- Build Post Pages ---
function buildPostPages(posts) {
    const postTemplate = readTemplate("post");
    const postsDir = path.join(DIST_DIR, "posts");
    ensureDir(postsDir);

    for (const post of posts.filter((p) => !p.draft)) {
        const content = renderTemplate(postTemplate, {
            post_title: post.title,
            post_date: formatDate(post.date),
            post_date_iso: new Date(post.date).toISOString(),
            reading_time: post.readingTime.toString(),
            post_content: post.html,
        });

        const html = wrapInBase(content, {
            title: `${post.title} — ${config.site_name}`,
            description: `${post.title} by ${config.author}`,
            og_type: "article",
            url: `${config.url}/posts/${post.slug}`,
            head: "",
        });

        const postDir = path.join(postsDir, post.slug);
        ensureDir(postDir);
        fs.writeFileSync(path.join(postDir, "index.html"), html);
        console.log(`  ✓ posts/${post.slug}/index.html`);
    }
}

// --- Build About Page ---
function buildAboutPage() {
    const aboutTemplate = readTemplate("about");

    let aboutHtml = "<h1>About</h1><p>Coming soon.</p>";
    if (fs.existsSync(ABOUT_FILE)) {
        const raw = fs.readFileSync(ABOUT_FILE, "utf-8");
        const { body } = fm(raw);
        aboutHtml = marked.parse(body);
    }

    const content = renderTemplate(aboutTemplate, {
        about_content: aboutHtml,
    });

    const html = wrapInBase(content, {
        title: `About — ${config.site_name}`,
        description: `About ${config.author}`,
        og_type: "website",
        url: `${config.url}/about`,
        head: "",
    });

    const aboutDir = path.join(DIST_DIR, "about");
    ensureDir(aboutDir);
    fs.writeFileSync(path.join(aboutDir, "index.html"), html);
    console.log("  ✓ about/index.html");
}

// --- Build 404 Page ---
function build404Page() {
    const content = `
    <div class="not-found animate-in">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <a href="/">← Go home</a>
    </div>
  `;

    const html = wrapInBase(content, {
        title: `404 — ${config.site_name}`,
        description: "Page not found",
        og_type: "website",
        url: config.url,
        head: "",
    });

    fs.writeFileSync(path.join(DIST_DIR, "404.html"), html);
    console.log("  ✓ 404.html");
}

// --- Build RSS Feed ---
function buildRSSFeed(posts) {
    const items = posts
        .filter((p) => !p.draft)
        .slice(0, 20)
        .map(
            (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${config.url}/posts/${p.slug}</link>
      <guid isPermaLink="true">${config.url}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.title}]]></description>
    </item>`
        )
        .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.site_name}</title>
    <link>${config.url}</link>
    <description>${config.description}</description>
    <language>en</language>
    <atom:link href="${config.url}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    fs.writeFileSync(path.join(DIST_DIR, "rss.xml"), rss);
    console.log("  ✓ rss.xml");
}

// --- Main Build ---
function build() {
    console.log("\n🌙 Luna Blog — Building...\n");

    // Clean dist
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true });
    }
    ensureDir(DIST_DIR);

    // Copy static assets
    if (fs.existsSync(STATIC_DIR)) {
        copyDirRecursive(STATIC_DIR, DIST_DIR);
        console.log("  ✓ Static assets copied");
    }

    // Parse posts
    const posts = getPosts();
    console.log(`  ℹ Found ${posts.length} post(s)\n`);

    // Build pages
    buildHomePage(posts);
    buildPostPages(posts);
    buildAboutPage();
    build404Page();
    buildRSSFeed(posts);

    console.log("\n✨ Build complete! Output: dist/\n");
}

build();

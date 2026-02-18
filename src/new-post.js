const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.resolve(__dirname, "..", "posts");

const title = process.argv.slice(2).join(" ") || "Untitled Post";
const date = new Date().toISOString().split("T")[0];
const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const filename = `${date}-${slug}.md`;
const filepath = path.join(POSTS_DIR, filename);

const content = `---
title: "${title}"
date: "${date}"
description: ""
tags: []
draft: true
---

Write your post here...
`;

if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

fs.writeFileSync(filepath, content);
console.log(`\n✨ Created new post: posts/${filename}\n`);

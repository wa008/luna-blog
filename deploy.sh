#!/bin/bash

# Deploy blog to Cloudflare Pages via git push

echo ""
echo "🚀 Deploying blog..."
echo "─────────────────────"

# Build the site first
echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix errors and try again."
  exit 1
fi

echo "✅ Build succeeded"

# Stage only posts and about page
git add posts/*md content/about.md

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "ℹ️  No changes to deploy."
  exit 0
fi

# Show what's being committed
echo ""
echo "📋 Changes:"
git diff --cached --stat
echo ""

# Commit with timestamp
MSG="Update blog — $(date '+%Y-%m-%d %H:%M')"
git commit -m "$MSG"

# Push
echo "☁️  Pushing to remote..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployed! Changes will be live shortly."
  echo ""
else
  echo ""
  echo "❌ Push failed. Make sure your remote is set up:"
  echo "   git remote add origin <your-repo-url>"
  echo ""
fi

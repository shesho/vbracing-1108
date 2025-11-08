---
title: "Deployment Strategy - Vercel"
date: "2025-11-08T18:30:00Z"
tags: ["deployment", "vercel", "ci-cd"]
excerpt: "Zero-config deployment to Vercel. GitHub integration for automatic deploys on push."
---

# Deployment Strategy - Vercel

## Why Vercel?
- Zero-config Next.js deployment
- Automatic builds on git push
- Global CDN
- Free tier sufficient for dev blogs
- Built-in environment variables

## Initial Setup
```bash
npm i -g vercel
vercel login
vercel --prod
```

Follow prompts. Note production URL for metadata.json.

## GitHub Integration (Recommended)
1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Auto-detects Next.js settings
4. Every push to main → auto-deploy

## Build Configuration
Vercel runs: `npm run build`

Our package.json:
```json
"scripts": {
  "build:api": "node scripts/generate-api.js",
  "build": "npm run build:api && next build"
}
```

So: git push → Vercel runs build → script generates API files → Next.js builds static export → deployed.

## Environment Variables
VERCEL_URL automatically set during build. Build script uses it to generate correct URLs in files.json.

## One-Time Metadata Update
After first deploy, update public/api/metadata.json with actual production URL:
```json
"fileList": {
  "url": "https://your-project.vercel.app/api/files.json"
}
```

Build script reads this for subsequent builds.

## Verification
Test all three endpoints:
- /api/metadata.json
- /api/files.json  
- /api/notes/[slug].md

Check CORS headers with browser dev tools.

## Workflow
1. Write note in content/notes/
2. Git commit + push
3. Vercel auto-deploys (~60s)
4. Note is live

No manual build steps. No FTP. No server config.


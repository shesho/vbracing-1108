---
title: "Project Setup - Decentralized Dev Notes"
date: "2025-11-08T17:30:00Z"
tags: ["setup", "meta", "architecture"]
excerpt: "Initial project scaffolding. Next.js 14 with static export. Three API endpoints defined."
---

# Project Setup - Decentralized Dev Notes

## Completed
- Next.js 14 project initialized with TypeScript
- Static export configuration (output: 'export')
- Directory structure: app/, content/notes/, lib/, public/api/, scripts/
- Three API endpoints spec'd out: metadata.json, files.json, notes/*.md
- Build script to auto-generate files.json from markdown frontmatter
- CORS headers configured in vercel.json

## Architecture Decisions
- Static export over server-side: zero runtime costs, maximum reliability
- Markdown with frontmatter: simple, portable, version-controllable
- File-based routing: slug from filename, no database needed
- Build-time generation: all endpoints pre-rendered

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- gray-matter for frontmatter parsing
- react-markdown for rendering

## Next Steps
- Write more dev notes
- Test build script
- Deploy to Vercel
- Verify all endpoints accessible


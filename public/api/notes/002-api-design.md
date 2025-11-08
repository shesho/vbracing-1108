---
title: "API Endpoint Design"
date: "2025-11-08T17:45:00Z"
tags: ["api", "architecture", "federation"]
excerpt: "Three-endpoint design for decentralized dev notes. Simple, static, CORS-enabled."
---

# API Endpoint Design

## The Three Endpoints

### 1. /api/metadata.json
Profile information and discovery
- Name, avatar, contact links
- Pointer to files.json location
- Version field for future compatibility
- Static file, manually maintained

### 2. /api/files.json
Index of all notes
- Auto-generated from content/notes/
- Sorted by date (newest first)
- Contains: id, title, slug, date, excerpt, url, tags
- Updated timestamp on each build

### 3. /api/notes/[slug].md
Individual note content
- Raw markdown with frontmatter
- Served as text/markdown
- Copied from content/ during build
- Named by slug for clean URLs

## Why Static?
- Fast: pre-rendered, CDN-cacheable
- Cheap: no server runtime costs
- Reliable: works on any static host
- Portable: just files, no vendor lock-in

## Federation Model
Phase 2 client will:
- Fetch metadata.json from each developer
- Follow fileList.url to get notes list
- Aggregate and display all notes
- Fetch individual notes on-demand

Simple, decentralized, no central authority needed.


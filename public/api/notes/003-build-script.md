---
title: "Build Script Implementation"
date: "2025-11-08T18:00:00Z"
tags: ["tooling", "automation", "dx"]
excerpt: "Automated generation of files.json. Validates frontmatter, copies files, updates timestamps."
---

# Build Script Implementation

## What It Does
Reads content/notes/*.md → Generates public/api/files.json

## Key Features
1. **Frontmatter validation**
   - Required: title, date
   - Optional: id, tags, excerpt
   - Validates ISO 8601 date format
   - Helpful error messages with filename

2. **URL derivation**
   - Checks NEXT_PUBLIC_SITE_URL env var
   - Falls back to VERCEL_URL (auto-set by Vercel)
   - Can read from metadata.json if neither set
   - Adds https:// prefix if needed

3. **File operations**
   - Copies .md files to public/api/notes/
   - Generates files.json with all metadata
   - Updates lastUpdated timestamp in metadata.json
   - Sorts notes by date (newest first)

4. **Slug generation**
   - Filename becomes slug: my-note.md → "my-note"
   - Can override with frontmatter `id` field
   - Keep filenames URL-safe

## Workflow
```bash
npm run build:api  # Run script
npm run build      # Runs build:api + next build
```

Vercel automatically runs full build on deploy.

## Error Handling
Exits with code 1 if:
- content/notes/ directory missing
- Frontmatter parse error
- Required fields missing
- Invalid date format
- No base URL derivable

Better to fail fast than deploy broken endpoints.


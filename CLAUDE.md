# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install Node.js version (requires mise)
mise install

# Install dependencies
npm install

# Build the site to _site/
npm run build

# Serve locally with live reload
npx @11ty/eleventy --serve

# Format, lint, and organise imports
npx @biomejs/biome check --write .
```

There are no tests.

## Architecture

This is a static blog built with [Eleventy](https://www.11ty.dev/), deployed on Cloudflare Pages.

- **Source**: `src/` — all input files
- **Output**: `_site/` — generated static site (do not edit)
- **Templates**: Liquid (`.liquid`) for layouts and pages; Markdown (`.md`) for posts
- **Global data**: `src/_data/site.json` — site title, description, and URL used throughout templates

### Template hierarchy

`layout.liquid` is the base HTML shell (all CSS lives inline here). `post.liquid` and `page.liquid` both extend `layout.liquid` via the `layout:` frontmatter key. Posts use `post.liquid` by default (set in `src/posts/posts.json`).

The `layout.liquid` conditionally injects `.demo` styles only when rendered content contains `class="demo"` — used for interactive demos embedded in posts.

### Posts

Posts live in `src/posts/` as Markdown files. The filename format is `YYYY-MM-DD-slug.md`. The date in the filename becomes the published date. The URL slug comes from the filename without the date prefix (configured in `src/posts/posts.json` via `"permalink": "/{{ page.fileSlug }}/"` — Eleventy strips the date automatically from `fileSlug`).

Required frontmatter for every post:

```yaml
---
title: Post Title
description: One-sentence description used in meta tags and structured data.
tags: [tag-one, tag-two]
---
```

The `post` tag is automatically applied to all posts via `src/posts/posts.json` and should not be added in individual post frontmatter.

### Tags

Tags appear on posts and are aggregated into tag pages. The `tags` and `tag-list` liquid files handle listing. Tag URLs are `/tags/<tag-name>/`. Hyphens in tag names are replaced with spaces in the display.

### Eleventy config (`/.eleventy.js`)

Custom filters: `readableDate` (→ "dd MMMM, yyyy"), `isoDate` (→ ISO 8601), `keys` (Object.keys). Atom feed is generated at `/feed.atom` for the 10 most recent posts.

### Security headers

`src/_headers` is a Cloudflare Pages headers file (not nginx) that gets copied to the site root. Edit it there — do not create server config files.

### Linting

Biome enforces tabs for indentation and double quotes for JS strings. Run `npx @biomejs/biome check --write .` before committing.

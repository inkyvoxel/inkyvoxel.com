# inkyvoxel.com - AI Agent Instructions

This file is a quick-start guide for coding agents. Link to source files instead of re-explaining implementation details.

## Start Here
- Read [README.md](README.md) for basic local setup.
- Confirm tools and scripts in [package.json](package.json), [mise.toml](mise.toml), and [biome.json](biome.json).
- Check build config and custom filters in [.eleventy.js](.eleventy.js).

## Verified Commands
- Install runtime: `mise install`
- Install dependencies: `npm install`
- Local dev server: `npx @11ty/eleventy --serve`
- Production build: `npm run build`
- Format/lint/imports: `npx @biomejs/biome check --write .`

## Validation Expectations
- There is no automated test suite (`npm test` is a placeholder and exits with an error).
- Validate work by running `npm run build` and checking generated output in `_site/`.

## Architecture
- Eleventy v3 static site, source in `src/`, output in `_site/`.
- ES module configuration (not CommonJS): [.eleventy.js](.eleventy.js).
- Async site metadata loading via `loadSiteData()` from [src/_data/site.json](src/_data/site.json).
- RSS feed configured with `@11ty/eleventy-plugin-rss` in [.eleventy.js](.eleventy.js).
- Minimal client-side JS footprint, primarily demos in [src/assets/js](src/assets/js).

## Important Conventions
- Posts live in `src/posts/YYYY-MM-DD-slug.md`.
- Directory defaults for all posts are in [src/posts/posts.json](src/posts/posts.json):
  - `layout: "post.liquid"`
  - `tags: "post"`
  - `permalink: "/{{ page.fileSlug }}/"`
- Because of the default `post` tag, always filter it out when rendering tag lists.
- Keep newest-first ordering for post lists/pagination (Eleventy defaults oldest-first).
- Use British English in user-facing text.

## Styling Rules
- Global styling is in [src/_includes/layout.liquid](src/_includes/layout.liquid) (inline CSS, no external stylesheet pipeline).
- Theme tokens are `--primary`, `--dark`, and `--light`.
- Container sizing is `width: 90%` and `max-width: 800px`.
- Preserve the existing voxel/retro visual language unless explicitly asked to redesign.

## Content Rules For Security Posts
- If content describes offensive-capable security techniques, include the disclaimer partial at the top:
  - `{% include 'disclaimer.liquid' %}`
- Reuse existing tags where possible (see posts in `src/posts/` for established taxonomy).

## Key Reference Files
- Build and filters: [.eleventy.js](.eleventy.js)
- Base layout and shared CSS: [src/_includes/layout.liquid](src/_includes/layout.liquid)
- Post layout and article schema: [src/_includes/post.liquid](src/_includes/post.liquid)
- Homepage pagination and blog schema: [src/index.liquid](src/index.liquid)
- Tag page generation and filtering: [src/tag-list.liquid](src/tag-list.liquid)
- Post defaults: [src/posts/posts.json](src/posts/posts.json)
- Site metadata: [src/_data/site.json](src/_data/site.json)
- Demo JavaScript example: [src/assets/js/fingerprint-demo.js](src/assets/js/fingerprint-demo.js)

## Common Pitfalls
- Forgetting to exclude the `post` tag when listing tags.
- Forgetting reverse/newest-first ordering in post loops.
- Breaking feed metadata by changing `src/_data/site.json` shape without updating `.eleventy.js`.
- Assuming Prettier/ESLint; this repo uses Biome conventions (tabs, double quotes in JS).

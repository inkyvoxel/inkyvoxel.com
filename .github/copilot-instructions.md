# inkyvoxel.com - AI Coding Guidelines

## Architecture Overview

Eleventy (11ty) static site generator blog with minimalist, monospace design. Source files in `src/`, built to `_site/`. Posts are Markdown with Liquid templating. Site config in `src/_data/site.json`. ES module config in `.eleventy.js` with async site data loading.

## File Structure & Conventions

- **Posts**: `src/posts/YYYY-MM-DD-title.md` with frontmatter (`title`, `description`, `tags: [cybersecurity, linux]`)
- **Templates**: Liquid files in `src/_includes/` (e.g., `layout.liquid`, `post.liquid`, `page.liquid`)
- **Pages**: Root-level `.liquid` or `.md` files in `src/` (e.g., `index.liquid`, `tags.liquid`)
- **Data**: Site config in `src/_data/site.json`
- **Build**: ES module config in `.eleventy.js` with async site data loading

## Key Patterns

- **Frontmatter**: Always include `title`, `description`, `tags` array (exclude 'post' tag in loops: `{% unless tag == 'post' %}`)
- **Date handling**: `{{ page.date | readableDate }}` for display, `{{ page.date | isoDate }}` for datetime attributes
- **Navigation**: Previous/next links using `{% assign previousPost = collections.post | getPreviousCollectionItem %}`
- **Tag pages**: Auto-generated via `tag-list.liquid` with pagination (e.g., `/tags/cybersecurity/`) using `{{ tag | slugify }}` permalinks
- **RSS**: Atom feed via `@11ty/eleventy-plugin-rss` configured in `.eleventy.js`
- **Collections**: `collections.post` for posts, `collections.all` for sitemap
- **Pagination**: Used in `index.liquid` for latest posts (`size: 5`, `reverse: true`), `tag-list.liquid` for tag pages
- **Post lists**: Reversed order (`{% for post in posts reversed %}`) for chronological display
- **Structured data**: Schema.org JSON-LD in templates for SEO
- **Analytics**: Umami integration with deferred script loading

## Language & Conventions

- **British English**: Use British English spelling in posts and all user-facing text (e.g., in HTML, titles, descriptions). Examples: "colour" not "color", "centre" not "center", "organise" not "organize".

## Development Workflow

- **Local dev**: `npx @11ty/eleventy --serve` (watches files, serves localhost)
- **Build**: `npm run build` or `npx @11ty/eleventy`
- **New post**: Create `src/posts/YYYY-MM-DD-title.md` with frontmatter
- **Add filter**: Define in `.eleventy.js` (e.g., `eleventyConfig.addFilter("readableDate", ...)`)
- **Passthrough assets**: Use `eleventyConfig.addPassthroughCopy()` in `.eleventy.js`

## Styling & Design

- **Layout**: Inline CSS in `layout.liquid`, CSS custom properties for themes (`--primary-color`, `--secondary-color`)
- **Themes**: Dark/light mode via `@media (prefers-color-scheme)` with color variables
- **Responsive**: Max-width 960px, 90% width on mobile
- **Code blocks**: `code` and `pre code` with padding/border-radius, background colors, box-shadow effects
- **Typography**: Monospace font, 1.6 line-height, 0.02em letter-spacing, optimizeLegibility text-rendering

## Dependencies

- `@11ty/eleventy`: Core generator
- `@11ty/eleventy-plugin-rss`: Feed generation
- `luxon`: Date formatting via custom filters (readableDate: "dd LLLL, yyyy", isoDate: ISO format)

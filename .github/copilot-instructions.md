# inkyvoxel.com - AI Coding Guidelines

## Architecture Overview

Eleventy (11ty) static site generator blog with minimalist, monospace design. Source files in `src/`, built to `_site/`. Posts are Markdown with Liquid templating. Site config in `src/_data/site.json`. **ES module config** (not CommonJS) in `.eleventy.js` with async site data loading.

## File Structure & Conventions

- **Posts**: `src/posts/YYYY-MM-DD-title.md` with frontmatter (`title`, `description`, `tags: [cybersecurity, linux]`)
  - Directory-level defaults in `src/posts/posts.json`: `layout: "post.liquid"`, `tags: "post"`, `permalink: "/{{ page.fileSlug }}/"`
- **Templates**: Liquid files in `src/_includes/` - hierarchy: `layout.liquid` (base) → `post.liquid`/`page.liquid` (content types)
- **Pages**: Root-level `.liquid` or `.md` files in `src/` (e.g., `index.liquid`, `tags.liquid`, `archives.liquid`)
- **Data**: Site metadata in `src/_data/site.json` (title, description, url)
- **Build output**: Static HTML in `_site/` with clean URLs (e.g., `/post-slug/index.html`)

## Key Patterns & Critical "Gotchas"

### Post Collections & Tag Filtering

- **Always exclude 'post' tag** in display loops: `{% unless tag == 'post' %}` (every post has this tag via `posts.json`)
- **Reverse order for chronological display**: `{% for post in posts reversed %}` (Eleventy defaults to oldest-first)
- Collections available: `collections.post` (all posts), `collections[tag]` (posts by tag), `collections.all` (sitemap)

### Date Handling

- Display dates: `{{ page.date | readableDate }}` → "03 May, 2025"
- ISO format: `{{ page.date | isoDate }}` → "2025-05-03T00:00:00.000Z"
- Luxon custom filters defined in `.eleventy.js`

### Pagination & Tag Pages

- **Homepage**: `index.liquid` paginates `collections.post` (5 per page, reversed)
- **Tag pages**: `tag-list.liquid` auto-generates `/tags/{tag}/` via pagination over `collections` object
  - Filters out `all` and `post` from tag list
  - Uses `eleventyComputed` for dynamic titles: `{{ tag | replace: '-', ' ' | capitalize }}`
  - Permalinks: `permalink: /tags/{{ tag | slugify }}/`

### Navigation & Schema.org

- **Previous/Next**: `collections.post | getPreviousCollectionItem` / `getNextCollectionItem` (built-in filters)
- **Structured data**: JSON-LD in `post.liquid` (Article schema) and `index.liquid` (Blog schema)

### RSS Feed

- Atom feed at `/feed.atom` via `@11ty/eleventy-plugin-rss` configured in `.eleventy.js`
- Pulls site metadata from async-loaded `site.json` (see `loadSiteData()` function)

## Development Workflow

### Local Development

```bash
mise install                   # Install Node.js LTS (defined in mise.toml)
npm install                    # First-time setup
npx @11ty/eleventy --serve     # Dev server with live reload (localhost:8080)
npm run build                  # Production build to _site/
```

### Code Quality

```bash
npx @biomejs/biome check --write .    # Format, lint, and organise imports
```

- **Biome configuration** in `biome.json`: tab indentation, double quotes for JavaScript, organise imports enabled

### Creating New Posts

1. Create `src/posts/YYYY-MM-DD-slug.md`
2. Add frontmatter:
   ```yaml
   ---
   title: Your Title Here
   description: Brief description for SEO and previews
   tags: [software-engineering, cybersecurity]
   ---
   ```
3. Write Markdown content (supports standard GFM)
4. **Existing tags** (use these for consistency): `ai`, `azure`, `cloud`, `cybersecurity`, `leadership`, `linux`, `self-hosting`, `software-engineering`
5. **Per-post styling**: Add `<style>` tags directly in Markdown for post-specific CSS (e.g., interactive demos)
   - Style scoped elements with custom classes (`.demo`, `.custom-widget`)
   - Use CSS variables `var(--primary)`, `var(--light)`, `var(--dark)` for theme consistency

### Extending Eleventy

- **Custom filters**: Add in `.eleventy.js` via `eleventyConfig.addFilter("name", fn)`
- **Passthrough copy**: `eleventyConfig.addPassthroughCopy({ "./src/file": "/output" })`
- **Example**: `robots.txt` copied from `src/` to `_site/` root
- **Includes pattern**: Reusable components in `src/_includes/` (e.g., `post-list.liquid` for consistent post listings)

### SEO & Analytics

- **Meta tags**: Full Open Graph + Twitter Card setup in `layout.liquid` (uses `{{ type }}` frontmatter for og:type)
- **Sitemap**: Auto-generated at `/sitemap.xml` from `collections.all`
- **Analytics**: Umami script in layout footer (self-hosted at `umami.inkyvoxel.app`)
- **Canonical URLs**: `{{ site.url }}{{ page.url }}` pattern for canonical links

## Styling & Design System

### CSS Architecture

- **All styles inline** in `src/_includes/layout.liquid` `<style>` block (no external CSS files)
- **CSS custom properties** for theming: `--primary`, `--dark`, `--light` (defined in body, used throughout)
- **Responsive**: `max-width: 960px; width: 90%;` for header/main/footer containers
- **Per-post custom CSS**: Posts can include `<style>` blocks for one-off interactive features

### Dark/Light Mode

```css
@media (prefers-color-scheme: dark) {
  body {
    --primary: #c6bdff;
    background-color: var(--dark);
  }
}
@media (prefers-color-scheme: light) {
  body {
    --primary: #4d31d8;
    background-color: var(--light);
  }
}
```

### Code Block Styling

- **Box-shadow effect**: `-3px 3px 0 #718093` (retro voxel aesthetic)
- **Border**: `2px solid #718093`
- Inline `code`: inverted colors (black on dark mode, white on light)

### Typography

- **Font**: `font-family: monospace` (system default)
- **Line-height**: `1.6`, **letter-spacing**: `0.02em`
- **Text rendering**: `optimizeLegibility`
- Date styling: `.date { font: italic 0.9rem monospace; }`

### Branding Element

- **3D Voxel cube**: CSS-only animation in header (`.voxel` class)
- `transform-style: preserve-3d` with 6 faces, `spin-cube` animation (360° X/Y rotation)

## Language & Conventions

- **British English**: Use British spelling in posts and all user-facing text (colour, centre, organise, etc.)
- **No exceptions**: Applies to HTML titles, meta descriptions, post content

## Dependencies & Configuration

- **`@11ty/eleventy` v3.0.0**: Core static site generator (dev dependency)
- **`@11ty/eleventy-plugin-rss` v2.0.2**: Atom feed generation (dev dependency)
- **`luxon`**: DateTime library for custom date filters (`readableDate`, `isoDate`) - imported in `.eleventy.js`
- **`@biomejs/biome` v2.3.8**: All-in-one formatter, linter, and import organiser (dev dependency)
- **`package.json` type**: `"type": "module"` (ES modules, not CommonJS)
- **`.eleventy.js` exports**: Default async function (for async site data loading via `loadSiteData()`)
- **Node.js version**: Managed by `mise` (LTS version specified in `mise.toml`)
- **Minimal dependencies**: No bundler, no framework beyond Eleventy, no external CSS/JS files

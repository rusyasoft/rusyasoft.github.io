# Progress Log

This file is the durable session memory for coding agents. Update it when scope, verification state, or next steps change.

## 2026-05-31 — Harness bootstrap for ACID agent-state blog post

### Goal

Build a lightweight harness around this Jekyll blog so future agent sessions can safely edit the article `_posts/2026-05-31-Managing-Agent-State-with-ACID-Principles.md` and the surrounding site.

### Repository observations

- Static blog built with Jekyll/GitHub Pages.
- Main content lives in `_posts/`.
- Target post already explains ACID principles for agent state and maps well to harness best practices.
- Before this session, no root `AGENTS.md`, standard verification script, progress file, feature state file, or generated-artifact `.gitignore` was present.

### Harness principles adopted

- **Instructions**: root `AGENTS.md` is the agent landing page.
- **State**: `feature_list.json` and this file record durable state.
- **Verification**: `./init.sh` is the standard startup/check path.
- **Scope**: one logical change at a time; content edits separate from theme edits.
- **Lifecycle**: `session-handoff.md` captures restartable handoff notes.

### Verification evidence

- `python3 scripts/validate_blog.py` passes for required checks. It reports legacy warnings for two older posts with unbalanced code fences:
  - `_posts/2018-07-29-cormen-divide-and-conquer.md`
  - `_posts/2019-02-25-git-usefull-commands.md`
- Local dependency setup was fixed by installing gems into `vendor/bundle`, forcing source gems, and using the macOS 14.5 SDK with system Ruby 2.6:

```bash
BUNDLE_PATH=vendor/bundle \
BUNDLE_FORCE_RUBY_PLATFORM=true \
SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX14.5.sdk \
bundle update nokogiri --conservative
```

- `Gemfile.lock` now uses `nokogiri 1.13.10`, which is compatible with Ruby 2.6.10.
- `_config.yml` now excludes `vendor`, `.bundle`, harness state files, and other local/generated directories from Jekyll source scanning.
- `./init.sh` passes end-to-end: structural validation, Bundler check, and `bundle exec jekyll build --trace`.

## 2026-07-11 — Architecture and implementation article with diagrams

### Goal

Publish the architecture article using the replacement draft and its nine supporting diagrams.

### Changed files

- Added `_posts/2026-07-11-architecture-as-part-of-implementation.md`.
- Added nine diagrams under `assets/images/architecture-implementation/`.
- Image references use the existing Jekyll `relative_url` pattern.

### Verification evidence

- `python3 scripts/validate_blog.py` passes.
- `./init.sh` passes end-to-end, including the Jekyll build.
- The validator still reports the two pre-existing legacy fenced-code warnings.

## 2026-07-11 — Article image layout adjustment

### Changed files

- Updated `_posts/2026-07-11-architecture-as-part-of-implementation.md` to keep the body free of inline diagrams.
- Grouped all nine diagrams after the article's final paragraph.
- Preserved the user's removal of the duplicate body title.

### Verification evidence

- `python3 scripts/validate_blog.py` passes.
- `./init.sh` passes end-to-end, including the Jekyll build.
- The validator still reports the two pre-existing legacy fenced-code warnings.

### Next step

Optional cleanup follow-up: fix the two legacy posts with unbalanced fenced code blocks so the validator can eventually fail on all unbalanced fences, not just the target ACID post.

## 2026-08-16 — P0 site defects: canonical URLs, advertising, responsive layout

### Goal

Close the three P0 issues from the site audit: #33 canonical URLs, #32 intrusive
and non-responsive advertising, #34 mobile horizontal overflow and article
readability.

### Changed files

- `_includes/_partials/head.html`: canonical falls back to `page.url`.
- `_config.yml`: explicit `url`, plus a documented `adsense` policy block.
- `_includes/_third-party/adsense/`: replaced `adsense.html` and
  `banner_adsense.html` with `enabled.html`, `loader.html`, `in-article.html`.
- `_includes/_layout.html`, `_partials/header.html`, `_partials/comments.html`,
  `_macro/post.html`: one loader, one ad placement, none above a heading.
- `_sass/_custom/custom.scss`: ad containment, media containment, scrolling
  tables, article typography, reduced mobile header padding.
- `scripts/check_responsive.js`: new headless-Chrome layout checker.
- `scripts/validate_blog.py`: new `--site` mode for built-HTML invariants.
- `init.sh`: runs both post-build check families.
- `_config.ads-preview.yml`: local overlay for checking ad layout in a dev build.

### Verification evidence

- `./init.sh` passes end-to-end, now including built-site and responsive checks.
- Built-site checks pass across 126 pages: one canonical each, absolute HTTPS,
  equal to the page's own permalink, `og:url` in agreement, at most one AdSense
  loader and initialisation, no Auto ads.
- Responsive checks pass across 13 pages x 7 widths (320, 360, 375, 390, 768,
  1024, 1440): `scrollWidth` equals `innerWidth` everywhere.
- Article text measures 16px/25.6px on phones, 17px/28.05px from 768px up, with
  a 612px measure at roughly 72 characters per line.
- With a production-shaped build (`--config _config.yml,_config.ads-preview.yml`)
  a forced 970px ad creative stays contained at 360px and 390px.
- Both new check families were confirmed to fail on an injected regression before
  being trusted.
- The two pre-existing legacy fenced-code warnings still stand.

### Blockers

- The single ad unit renders only once `adsense.in_article_slot` is set in
  `_config.yml`. Until then the site ships no ad markup, by design.

### Next step

Nothing blocking. The remaining audit issues are P1: #35 accessibility (the
viewport meta still sets `maximum-scale=1`, which blocks pinch zoom), #36-#38
brand and metadata, #37 taxonomy, and the three editorial issues #39-#41.

## 2026-08-16 — P1 SEO, metadata, and presentation: #38, #36, #42

### Goal

Close three related audit issues in one pass: #38 (author metadata, social
previews, reading time, BlogPosting schema), #36 (homepage/About author brand),
and #42 (third-party integration hygiene). The #42 AdSense duplicate-init bug was
already resolved by the P0 work and is enforced by `validate_blog.py --site`; this
pass finished the third-party hygiene around it.

### Changed files

- `_config.yml`: professional `title`/`subtitle`/`description`; `author_profile`
  and `og_image`; relevant default `keywords`; deferred Disqus (`hide: true`,
  `count: false`) with a documented policy.
- `_includes/_helper/open_graph.html`: one intentional social image (front-matter
  `image`, then first gallery photo, then site `og_image` fallback), always
  absolute HTTPS; `summary_large_image` only when a real image exists; added
  `article:published_time` / `article:modified_time` / `article:author`. Removed
  the inline-`<img>` scrape that emitted nine relative `og:image` tags.
- `_includes/_partials/head/structured-data.html` (new): `BlogPosting` JSON-LD on
  posts, `WebSite` on the homepage, nothing elsewhere. Wired into `head.html`.
- `_includes/_macro/post.html`: visible byline (author + reading time); article
  titles are `<h2>` in the index feed and `<h1>` on their own page; optional
  `disclosure` front-matter note.
- `_includes/index.html`: homepage hero carrying the single page `<h1>`, a
  curated "Featured writing" section (`featured: true` posts), then the feed.
- `about/index.md`: professional narrative, corrected terminology (Programming
  Languages, Node.js, MySQL, Amazon RDS), personal-views disclaimer.
- `_includes/_partials/comments.html` + `_third-party/comments/disqus.html`:
  Disqus loads only on a keyboard-focusable "Show comments" click or when the
  comments section nears the viewport (IntersectionObserver).
- `privacy/index.md` (new) + `_partials/footer.html`: a privacy/third-party
  disclosure page linked from the footer.
- `_sass/_custom/custom.scss`: hero, featured list, byline, disclosure note,
  deferred-comments button, footer links (reuses existing theme variables).
- Featured front matter added to three posts (architecture, ACID, architect);
  the first two carry a primary `image` for a large social card.
- `scripts/validate_blog.py`: new `--site` invariants — at most one og:image,
  absolute HTTPS social images, valid twitter:card, one `<h1 class="post-title">`
  per post, required `BlogPosting` keys, one homepage `<h1>`, homepage `WebSite`
  JSON-LD.

### Verification evidence

- `./init.sh` passes end-to-end across 127 pages (added the privacy page).
- All 117 JSON-LD blocks parse; every post BlogPosting has headline, url,
  datePublished, author.name, publisher, mainEntityOfPage.
- Newest post now emits one absolute `og:image`; featured posts with an `image`
  emit `summary_large_image`; the avatar fallback stays `summary`.
- Homepage renders exactly one `<h1>` (brand) with post titles as `<h2>`.
- No Disqus `embed.js` or `count.js` request ships until the reader asks.
- The two pre-existing legacy fenced-code warnings still stand.

### Notes / follow-ups

- Employment ("Amazon") mirrors the pre-existing About page; the author should
  confirm it is current (issue #36 asks for verified employment only).
- First-party related-post links (versus Disqus recommendations) remain a
  possible #42 follow-up; deferral already stops them loading on view.
- Legacy posts use `#` headings inside the body (multiple `<h1>` in content); the
  new h1 invariant checks the template title only, not legacy body content.

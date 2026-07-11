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

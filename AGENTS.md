# AGENTS.md

This is a GitHub Pages/Jekyll blog repository. The harness goal is to let an agent safely edit posts, verify the site builds, and leave a clean handoff for the next session.

## Startup Workflow

Before changing files:

1. Run `pwd` and confirm you are at the repository root.
2. Read `progress.md` and `feature_list.json` for current state.
3. Review recent changes with `git status --short` and `git log --oneline -5`.
4. Run `./init.sh` to verify the baseline. If it fails, do not stack new content work on top of the broken state.

## Repository Map

- `_posts/`: blog posts in Jekyll format, named `YYYY-MM-DD-slug.md`.
- `_layouts/`, `_includes/`, `_sass/`: theme/layout code.
- `_config.yml`: site configuration and plugin list.
- `scripts/validate_blog.py`: lightweight structural checks for posts and the featured ACID harness article. With `--site`, checks the generated HTML instead: canonical/`og:url` agreement and the ad-loading invariants.
- `scripts/check_responsive.js`: serves the built site and drives headless Chrome to assert no horizontal overflow and readable article text across viewport widths.
- `feature_list.json`: source of truth for harness/content work state.
- `progress.md`: durable session log and verification evidence.

## Working Rules

- Work on one logical change at a time.
- Keep blog content changes separate from theme/layout changes unless the task explicitly requires both.
- Do not mark work complete because text was edited; completion requires verification evidence.
- For posts, preserve YAML front matter and Jekyll filename conventions.
- Prefer durable repo artifacts (`progress.md`, `session-handoff.md`, post comments/tests) over chat-only memory.
- Do not commit generated output such as `_site/`, `.jekyll-cache/`, or `.sass-cache/`.

## Verification

Standard verification path:

```bash
./init.sh
```

This runs structural post checks, builds the site via Bundler, then checks the generated HTML and the responsive layout. The layout pass needs Google Chrome and Node; it is skipped with a notice when either is missing. If Bundler dependencies are missing, run:

```bash
BUNDLE_PATH=vendor/bundle BUNDLE_FORCE_RUBY_PLATFORM=true bundle install
./init.sh
```

On this macOS/system-Ruby setup, `init.sh` also defaults `SDKROOT` to the macOS 14.5 SDK when present so native gems can compile against Ruby 2.6 headers. That SDK is no longer installed on newer macOS, and as of 2026-08 the gems build without it. Recording the settings once avoids passing them on every command:

```bash
bundle config --local path vendor/bundle
bundle config --local force_ruby_platform true
bundle install
```

In a git worktree, point `path` at the main checkout's `vendor/bundle` to reuse the installed gems instead of building them again.

## Definition of Done

A change is done only when:

- The requested content/code change is implemented.
- `python3 scripts/validate_blog.py` passes.
- `bundle exec jekyll build --trace` passes, or dependency failure is explicitly recorded as the blocker.
- For theme or layout changes, `python3 scripts/validate_blog.py --site` and `node scripts/check_responsive.js` pass against a fresh build.
- `feature_list.json` and `progress.md` reflect actual verified state.
- No unrelated files or generated artifacts are left behind.

## End-of-Session Checklist

1. Run `git status --short`.
2. Run `./init.sh` or record exactly why it cannot run.
3. Update `progress.md` with changed files, verification, blockers, and next step.
4. Update `feature_list.json` statuses if feature state changed.
5. Leave a compact `session-handoff.md` update for larger/incomplete work.

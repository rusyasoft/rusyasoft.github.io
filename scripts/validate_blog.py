#!/usr/bin/env python3
"""Lightweight repository checks for the Jekyll blog harness.

No third-party dependencies are required. These checks intentionally focus on
agent-useful invariants: post naming, required front matter, balanced fenced
code blocks, and key coverage for the ACID harness article.

Run with --site after a Jekyll build to check the generated HTML instead: the
canonical/og:url agreement and the ad-loading invariants, neither of which is
visible in the sources.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "_posts"
SITE = ROOT / "_site"
TARGET = POSTS / "2026-05-31-Managing-Agent-State-with-ACID-Principles.md"

SITE_URL = "https://rusyasoft.github.io"
CANONICAL_RE = re.compile(r'<link rel="canonical" href="([^"]*)"')
OG_URL_RE = re.compile(r'<meta property="og:url" content="([^"]*)"')
AD_LOADER_RE = re.compile(r"adsbygoogle\.js")
AD_PUSH_RE = re.compile(r"adsbygoogle\s*=\s*window\.adsbygoogle")

# Pages built from a layout that has no <head> include, so they carry no canonical.
NO_CANONICAL_ALLOWED = {"404.html", "404 copy.html", "google18d554b47bfebf5f.html"}

# Pages that deliberately canonicalize somewhere other than their own permalink,
# via `canonical_path` in front matter. Keyed by path within _site. Add an entry
# here when you add the front matter, so the intent is recorded in one place.
CANONICAL_OVERRIDES: dict[str, str] = {}

# Jekyll leaves these characters literal in page.url; anything else is escaped.
URL_SAFE_CHARS = "/,"

FILENAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-.+\.md$")
REQUIRED_FRONT_MATTER = ("title", "categories", "tags")
REQUIRED_ACID_TERMS = (
    "Atomicity",
    "Consistency",
    "Isolation",
    "Durability",
    "harness",
    "verification",
    "git commit",
)


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def parse_front_matter(path: Path) -> tuple[dict[str, str], str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        fail(f"{path.relative_to(ROOT)} is missing YAML front matter")
    end = text.find("\n---\n", 4)
    if end == -1:
        fail(f"{path.relative_to(ROOT)} has unterminated YAML front matter")

    raw = text[4:end]
    body = text[end + len("\n---\n") :]
    data: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip() or line.startswith(" ") or line.lstrip().startswith("-"):
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip()
    return data, body


def has_unbalanced_fenced_code_blocks(text: str) -> bool:
    fence_count = sum(1 for line in text.splitlines() if line.lstrip().startswith("```"))
    return fence_count % 2 != 0


def check_posts() -> None:
    if not POSTS.exists():
        fail("_posts directory is missing")

    posts = sorted(POSTS.glob("*.md"))
    if not posts:
        fail("_posts contains no markdown posts")

    titles: dict[str, Path] = {}
    legacy_warnings: list[str] = []
    for post in posts:
        rel = post.relative_to(ROOT)
        if not FILENAME_RE.match(post.name):
            fail(f"{rel} does not follow YYYY-MM-DD-slug.md naming")
        front, body = parse_front_matter(post)
        for key in REQUIRED_FRONT_MATTER:
            if key not in front:
                fail(f"{rel} is missing front matter key: {key}")
        title = front.get("title", "").strip(' \"\'')
        if title:
            if title in titles:
                fail(f"duplicate post title {title!r}: {titles[title].relative_to(ROOT)} and {rel}")
            titles[title] = post
        if post != TARGET and has_unbalanced_fenced_code_blocks(body):
            legacy_warnings.append(f"WARN: {rel} has unbalanced fenced code blocks (legacy content)")

    for warning in legacy_warnings[:10]:
        print(warning)
    if len(legacy_warnings) > 10:
        print(f"WARN: {len(legacy_warnings) - 10} additional legacy posts have unbalanced fenced code blocks")


def check_target_post() -> None:
    if not TARGET.exists():
        fail(f"target post missing: {TARGET.relative_to(ROOT)}")
    text = TARGET.read_text(encoding="utf-8")
    if has_unbalanced_fenced_code_blocks(text):
        fail("target ACID harness post has unbalanced fenced code blocks")

    missing = [term for term in REQUIRED_ACID_TERMS if term not in text]
    if missing:
        fail(f"target ACID harness post is missing expected terms: {', '.join(missing)}")

    for heading in ("## Atomicity", "## Consistency", "## Isolation", "## Durability"):
        if heading not in text:
            fail(f"target ACID harness post is missing section heading: {heading}")


def expected_canonical(page: Path) -> str:
    """The public URL a generated file should claim as its own."""
    rel = page.relative_to(SITE)
    url = "/" if rel.name == "index.html" and rel.parent == Path(".") else f"/{rel.parent.as_posix()}/"
    if rel.name != "index.html":
        url = f"/{rel.as_posix()}"
    return SITE_URL + quote(url, safe=URL_SAFE_CHARS)


def check_built_site() -> None:
    """Assert the invariants that only exist in generated HTML."""
    if not SITE.exists():
        fail(f"{SITE.relative_to(ROOT)} is missing. Run the Jekyll build before --site checks")

    pages = sorted(SITE.rglob("*.html"))
    if not pages:
        fail("_site contains no generated HTML")

    checked = 0
    without_canonical: list[str] = []
    for page in pages:
        rel = page.relative_to(SITE).as_posix()
        text = page.read_text(encoding="utf-8", errors="replace")

        canonicals = CANONICAL_RE.findall(text)
        if len(canonicals) > 1:
            fail(f"{rel} emits {len(canonicals)} canonical tags, expected exactly one")
        if not canonicals:
            if rel not in NO_CANONICAL_ALLOWED:
                without_canonical.append(rel)
            continue

        canonical = canonicals[0]
        expected = CANONICAL_OVERRIDES.get(rel, expected_canonical(page))
        if canonical != expected:
            fail(
                f"{rel} canonicalizes to {canonical}, expected {expected}. "
                "If this page sets canonical_path on purpose, record it in CANONICAL_OVERRIDES"
            )
        if not canonical.startswith("https://"):
            fail(f"{rel} has a non-HTTPS canonical URL: {canonical}")
        if "index.html" in canonical or "?" in canonical or "#" in canonical:
            fail(f"{rel} has a malformed canonical URL: {canonical}")
        if "//" in canonical[len("https://"):]:
            fail(f"{rel} has a duplicate slash in its canonical URL: {canonical}")

        og_urls = OG_URL_RE.findall(text)
        if og_urls and og_urls[0] != canonical:
            fail(f"{rel} og:url {og_urls[0]} does not match canonical {canonical}")

        # One loader and at most one unit per page. Two loaders is what produced
        # duplicate adsbygoogle initialisation errors, and page-level ads are the
        # Auto ads setting that decided placement outside this repository.
        loaders = len(AD_LOADER_RE.findall(text))
        if loaders > 1:
            fail(f"{rel} loads the AdSense library {loaders} times, expected at most one")
        pushes = len(AD_PUSH_RE.findall(text))
        if pushes > 1:
            fail(f"{rel} initialises adsbygoogle {pushes} times, expected at most one")
        if "enable_page_level_ads" in text:
            fail(f"{rel} still enables Auto ads, which places ads outside this repository's control")

        checked += 1

    if without_canonical:
        listed = ", ".join(without_canonical[:5])
        fail(f"{len(without_canonical)} generated pages have no canonical tag: {listed}")

    homepage = SITE / "index.html"
    if homepage.exists():
        canonical = CANONICAL_RE.findall(homepage.read_text(encoding="utf-8"))
        if canonical != [f"{SITE_URL}/"]:
            fail(f"homepage canonical is {canonical}, expected ['{SITE_URL}/']")

    print(f"OK: built-site checks passed across {checked} pages")


def main() -> int:
    if "--site" in sys.argv[1:]:
        check_built_site()
        return 0
    check_posts()
    check_target_post()
    print("OK: blog structure checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Lightweight repository checks for the Jekyll blog harness.

No third-party dependencies are required. These checks intentionally focus on
agent-useful invariants: post naming, required front matter, balanced fenced
code blocks, and key coverage for the ACID harness article.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "_posts"
TARGET = POSTS / "2026-05-31-Managing-Agent-State-with-ACID-Principles.md"

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


def main() -> int:
    check_posts()
    check_target_post()
    print("OK: blog structure checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

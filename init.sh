#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "== Blog harness startup =="
echo "root: $ROOT"
export BUNDLE_PATH="${BUNDLE_PATH:-vendor/bundle}"
export BUNDLE_FORCE_RUBY_PLATFORM="${BUNDLE_FORCE_RUBY_PLATFORM:-true}"
if [[ "$(uname -s)" == "Darwin" && -d "/Library/Developer/CommandLineTools/SDKs/MacOSX14.5.sdk" ]]; then
  export SDKROOT="${SDKROOT:-/Library/Developer/CommandLineTools/SDKs/MacOSX14.5.sdk}"
fi

echo "ruby: $(ruby --version 2>/dev/null || echo missing)"
echo "bundler: $(bundle --version 2>/dev/null || echo missing)"
echo "bundle path: $BUNDLE_PATH"
echo "force ruby platform: $BUNDLE_FORCE_RUBY_PLATFORM"
echo "sdkroot: ${SDKROOT:-unset}"

echo "== Structural blog validation =="
python3 scripts/validate_blog.py

echo "== Bundler dependency check =="
if ! command -v bundle >/dev/null 2>&1; then
  echo "ERROR: Bundler is not installed. Install Bundler, then rerun ./init.sh" >&2
  exit 1
fi

if ! bundle check >/dev/null 2>&1; then
  echo "ERROR: Bundler dependencies are missing or cannot be built in this local environment." >&2
  echo "Run: BUNDLE_PATH=vendor/bundle BUNDLE_FORCE_RUBY_PLATFORM=true bundle install" >&2
  echo "On macOS with system Ruby 2.6, use the macOS 14 SDK when available:" >&2
  echo "  SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX14.5.sdk BUNDLE_PATH=vendor/bundle BUNDLE_FORCE_RUBY_PLATFORM=true bundle install" >&2
  echo "If native gems still fail, install platform build tools or use a Ruby/GitHub Pages dev container." >&2
  exit 1
fi

echo "== Jekyll build =="
bundle exec jekyll build --trace

echo "== Built-site checks =="
python3 scripts/validate_blog.py --site

echo "== Responsive layout checks =="
if command -v node >/dev/null 2>&1; then
  node scripts/check_responsive.js
else
  echo "SKIP: node is not installed, so responsive layout checks did not run."
fi

echo "== Clean-state reminder =="
echo "Review git status and do not commit generated artifacts:"
git status --short

echo "== OK: standard verification completed =="

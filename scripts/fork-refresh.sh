#!/usr/bin/env bash
set -euo pipefail

# Rebuild a branch on top of upstream/master, then replay all custom commits
# from a source branch (default: origin/master).
#
# Usage:
#   scripts/fork-refresh.sh [source_branch] [target_branch]
#
# Example:
#   scripts/fork-refresh.sh origin/master sync/upstream-replay

SOURCE_BRANCH="${1:-origin/master}"
TARGET_BRANCH="${2:-sync/upstream-replay}"
UPSTREAM_REF="upstream/master"

git fetch upstream origin --prune

if ! git rev-parse --verify "$SOURCE_BRANCH" >/dev/null 2>&1; then
  echo "[fork-refresh] Source branch not found: $SOURCE_BRANCH" >&2
  exit 1
fi

if ! git rev-parse --verify "$UPSTREAM_REF" >/dev/null 2>&1; then
  echo "[fork-refresh] Upstream ref not found: $UPSTREAM_REF" >&2
  exit 1
fi

COMMITS=$(git rev-list --reverse --no-merges "$UPSTREAM_REF..$SOURCE_BRANCH")

git checkout -B "$TARGET_BRANCH" "$UPSTREAM_REF"

if [ -z "$COMMITS" ]; then
  echo "[fork-refresh] No custom commits to replay from $SOURCE_BRANCH"
  exit 0
fi

echo "[fork-refresh] Replaying commits from $SOURCE_BRANCH onto $UPSTREAM_REF"

for commit in $COMMITS; do
  echo "[fork-refresh] cherry-pick $commit"
  if ! git cherry-pick -x "$commit"; then
    echo ""
    echo "[fork-refresh] Conflict while replaying $commit" >&2
    echo "Resolve files, then run: git cherry-pick --continue" >&2
    echo "Or abort with: git cherry-pick --abort" >&2
    exit 2
  fi
done

echo "[fork-refresh] Done. Branch ready: $TARGET_BRANCH"

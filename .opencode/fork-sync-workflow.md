# Private Fork Sync Workflow

This repo tracks `upstream` (official 9router) plus your private customizations.

Goal: make upstream updates + replaying your custom code predictable and low-risk.

## One-time setup

1. Keep remotes:
   - `upstream` -> official 9router
   - `origin` -> your private fork
2. Enable conflict memory (recommended):

```bash
git config rerere.enabled true
git config rerere.autoupdate true
```

3. Keep custom work as normal commits on your fork branch (do not squash everything into one mega-commit).

## Standard update flow

### A) Replay custom commits onto latest upstream

```bash
scripts/fork-refresh.sh origin/master sync/upstream-replay
```

- Starts from `upstream/master`
- Replays commits unique to `origin/master` using `cherry-pick -x`
- Stops on conflict so you can resolve safely

If conflict occurs:

```bash
git status
# resolve files
git add <resolved-files>
git cherry-pick --continue
```

### B) Validate before pushing

Run your required test suite for web-ui integrations and proxy bridge logic.

At minimum:

```bash
node --test test-duck-web.mjs
node --test test-grok-imagine.mjs
```

### C) Push replay branch

```bash
git push origin sync/upstream-replay
```

Then fast-forward your main fork branch via PR or direct merge.

## Guardrails

- Never commit local captures/tokens (`*.har`, cookie dumps, local test outputs).
- Keep Chat2API proxy bridge isolated in dedicated files (`src/lib/chat2apiProxy.js`, related tests/routes).
- Prefer additive integration with 9router architecture (provider registry + executors + API routes), instead of broad rewrites.

## Design rule for this fork

Follow upstream 9router app setup as-is.

The fork-specific difference should be:
- porting Chat2API proxy logic
- using it to support/route Web UI providers via 9router APIs

This keeps upstream merges smaller and easier to replay.

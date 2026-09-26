<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# House rules for this repo

Before finishing any change, run `npx tsc --noEmit`, `npm run lint` and `npm test`. `tests/architecture/rules.test.ts` enforces the security and structure rules (withAuth on every API route, session checks on private pages, `server-only` server modules, no secrets or unsafe patterns) and CI blocks production deploys when it fails. The rules and their reasons are listed in README.md under *House rules (enforced)* — follow them rather than adding allowlist exceptions.

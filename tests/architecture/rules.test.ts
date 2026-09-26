import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_PATHS } from "@/constants/auth";

/**
 * House rules, checked on every push (CI "App checks", which blocks
 * production deploys). Each rule reads the source itself, so a change that
 * breaks one fails here with the file and the fix — before it reaches
 * learners. If a rule ever needs an exception, add it to that rule's
 * allowlist with the reason, so the exception is reviewed like code.
 */

const ROOT = process.cwd();

interface SourceFile {
  path: string; // repo-relative, forward slashes
  src: string;
}

function sourceFiles(dir: string): SourceFile[] {
  const out: SourceFile[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        if (name === "generated" || name === "node_modules") continue;
        walk(p);
      } else if (/\.(ts|tsx)$/.test(name)) {
        out.push({ path: relative(ROOT, p).replaceAll("\\", "/"), src: readFileSync(p, "utf8") });
      }
    }
  };
  walk(join(ROOT, dir));
  return out;
}

const SRC = sourceFiles("src");
const isClient = (f: SourceFile) => /^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(f.src);
const isServerAction = (f: SourceFile) => /^\s*["']use server["']/.test(f.src);

/** Lines of `src` matching `re`, as "path:line: text" for readable failures. */
function hits(f: SourceFile, re: RegExp): string[] {
  return f.src
    .split(/\r?\n/)
    .flatMap((line, i) => (re.test(line) ? [`${f.path}:${i + 1}: ${line.trim()}`] : []));
}

describe("API routes", () => {
  const routes = SRC.filter((f) => /^src\/app\/api\/.*\/route\.ts$/.test(f.path));

  /** Routes meant to work without a login — none today. Add "path": "reason" to make one public. */
  const PUBLIC_API_ROUTES: Record<string, string> = {};

  it("exist (sanity check for the rules below)", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it("every handler goes through withAuth (real session check, validation, safe errors)", () => {
    const bad = routes.flatMap((f) => {
      if (PUBLIC_API_ROUTES[f.path]) return [];
      return [...f.src.matchAll(/export\s+(?:async\s+)?(?:const|function)\s+(GET|POST|PUT|PATCH|DELETE)\b(.*)/g)]
        .filter((m) => !/=\s*withAuth\s*(<[^>]*>)?\s*\(/.test(m[2]))
        .map((m) => `${f.path}: ${m[1]} must be \`export const ${m[1]} = withAuth(async ({ req, userId, params }) => …)\``);
    });
    expect(bad).toEqual([]);
  });

  it("request bodies are read with readJson(req, schema), never raw req.json()", () => {
    const bad = routes.flatMap((f) => hits(f, /\b(req|request)\.json\(\)/));
    expect(bad).toEqual([]);
  });
});

describe("pages", () => {
  const pages = SRC.filter((f) => /^src\/app\/.*page\.tsx$/.test(f.path));

  /** "/quran/[chapter]" for src/app/quran/[chapter]/page.tsx — route groups like (auth) drop out. */
  const routeOf = (path: string) =>
    "/" +
    path
      .replace(/^src\/app\/?/, "")
      .replace(/\/?page\.tsx$/, "")
      .split("/")
      .filter((seg) => seg && !/^\(.*\)$/.test(seg))
      .join("/");
  const isPublic = (route: string) => PUBLIC_PATHS.some((p) => route === p || route.startsWith(`${p}/`));

  it("every page outside PUBLIC_PATHS checks the session itself (the proxy only sees that a cookie exists)", () => {
    const bad = pages
      .filter((f) => !isPublic(routeOf(f.path)))
      .filter((f) => !/\b(getCurrentUserId|getSessionUser)\s*\(/.test(f.src))
      .map((f) => `${f.path} (${routeOf(f.path)}): call \`await getCurrentUserId()\` from "@/server/lib"`);
    expect(bad).toEqual([]);
  });
});

describe("server / browser boundary", () => {
  it('every server module starts with import "server-only" (the build then fails if the browser imports it)', () => {
    const bad = SRC.filter((f) => f.path.startsWith("src/server/") && !isServerAction(f))
      .filter((f) => !/^import "server-only";/.test(f.src.trimStart()))
      .map((f) => `${f.path}: add \`import "server-only";\` as the first line`);
    expect(bad).toEqual([]);
  });

  it("browser code reaches the server only through server actions", () => {
    const bad = SRC.filter(isClient).flatMap((f) =>
      [...f.src.matchAll(/from\s+["'](@\/server(?!\/actions)[^"']*|@\/generated[^"']*)["']/g)].map(
        (m) => `${f.path}: client component imports ${m[1]} — call an API route or a server action instead`
      )
    );
    expect(bad).toEqual([]);
  });

  it("browser code never reads private environment variables", () => {
    const bad = SRC.filter(isClient).flatMap((f) =>
      [...f.src.matchAll(/process\.env\.(\w+)/g)]
        .filter((m) => !m[1].startsWith("NEXT_PUBLIC_") && m[1] !== "NODE_ENV")
        .map((m) => `${f.path}: reads process.env.${m[1]} in the browser`)
    );
    expect(bad).toEqual([]);
  });

  it("server actions other than sign-in/sign-up/reset check the session", () => {
    const PUBLIC_ACTION_FILES = new Set(["src/server/actions/auth.ts"]); // login, signup, logout, password reset
    const bad = SRC.filter((f) => isServerAction(f) && !PUBLIC_ACTION_FILES.has(f.path)).flatMap((f) =>
      [...f.src.matchAll(/export\s+async\s+function\s+(\w+)\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\}/g)]
        .filter((m) => !/\bgetCurrentUserId\s*\(/.test(m[2]))
        .map((m) => `${f.path}: ${m[1]} must start with \`const userId = await getCurrentUserId();\``)
    );
    expect(bad).toEqual([]);
  });
});

describe("dangerous patterns", () => {
  const RULES: [RegExp, string][] = [
    [/dangerouslySetInnerHTML/, "renders raw HTML (XSS risk) — render text as JSX instead"],
    [/(^|[^.\w])eval\s*\(/, "eval runs arbitrary code"],
    [/new\s+Function\s*\(/, "new Function runs arbitrary code"],
    [/\$(queryRawUnsafe|executeRawUnsafe)\b/, "unsafe raw SQL (injection risk) — use Prisma queries or tagged $queryRaw"],
  ];

  it.each(RULES)("no %s", (re, why) => {
    const bad = SRC.flatMap((f) => hits(f, re)).map((h) => `${h}  ← ${why}`);
    expect(bad).toEqual([]);
  });
});

describe("secrets", () => {
  let tracked: string[] = [];
  try {
    tracked = execSync("git ls-files", { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
      .split("\n")
      .filter(Boolean);
  } catch {
    // Not a git checkout (e.g. a zip) — CI always is.
  }

  it.runIf(tracked.length > 0)("no .env file is committed (only .env.example)", () => {
    expect(tracked.filter((f) => /(^|\/)\.env(\..+)?$/.test(f) && !f.endsWith(".env.example"))).toEqual([]);
  });

  const PATTERNS: [RegExp, string][] = [
    [/AIza[0-9A-Za-z_-]{35}/, "Google API key"],
    [/\bnpg_[A-Za-z0-9]{10,}/, "Neon database password"],
    [/postgres(?:ql)?:\/\/[^\s:@/"'`]+:(?!password@|ci@)[^\s@/"'`]+@(?!localhost)[^\s"'`]+/, "database URL with a real password"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
    [/\bre_[A-Za-z0-9]{20,}\b/, "Resend API key"],
    [/\bsk_(live|test)_[A-Za-z0-9]{16,}/, "secret API key"],
  ];

  it.runIf(tracked.length > 0)("no credentials in committed files", () => {
    const TEXT = /\.(ts|tsx|js|mjs|cjs|json|md|sql|yml|yaml|toml|py|txt|env\.example|prisma|css|html)$/;
    const bad: string[] = [];
    for (const file of tracked.filter((f) => TEXT.test(f) || f.endsWith(".env.example"))) {
      let text: string;
      try {
        text = readFileSync(join(ROOT, file), "utf8");
      } catch {
        continue; // deleted in the working tree
      }
      if (text.length > 5_000_000) continue; // corpus data, not config
      for (const [re, what] of PATTERNS) if (re.test(text)) bad.push(`${file}: looks like a ${what}`);
    }
    expect(bad).toEqual([]);
  });
});

import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Mirrors the "@/*" -> "./src/*" path alias in tsconfig.json so tests/
// can import app code the same way components do.
export default defineConfig(({ mode }) => {
  // Next.js loads .env automatically for the app itself; vitest doesn't, so
  // any test touching src/server/databases/db.ts (or anything else reading process.env)
  // needs it loaded explicitly here.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value;
  }

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // The real package throws outside a React Server Component graph.
        "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
      },
    },
    test: {
      // Tests live in tests/, mirroring src/.
      include: ["tests/**/*.test.ts"],
    },
  };
});

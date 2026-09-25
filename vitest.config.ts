import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Mirrors the "@/*" -> "./src/*" path alias in tsconfig.json so test files
// can import app code the same way components do.
export default defineConfig(({ mode }) => {
  // Next.js loads .env automatically for the app itself; vitest doesn't, so
  // any test touching src/lib/db.ts (or anything else reading process.env)
  // needs it loaded explicitly here.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value;
  }

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

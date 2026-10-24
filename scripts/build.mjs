import { build } from "vite";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let sourceCommit = null;
let sourceDirty = null;
try {
  sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  sourceDirty =
    execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
    }).trim().length > 0;
} catch {
  // Builds from a source archive may not have Git metadata; never invent a SHA.
}
await build({ root });
await writeFile(
  resolve(root, "dist/version.json"),
  JSON.stringify(
    {
      application: "دادوین",
      sourceCommit,
      sourceDirty,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);

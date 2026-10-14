import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";

await mkdir(".qa", { recursive: true });
await build({
  entryPoints: ["tests/auth-contract.test.jsx"],
  outfile: ".qa/auth-contract.test.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  define: { "import.meta.env": "{}" },
});
const result = spawnSync(
  process.execPath,
  ["--test", ".qa/auth-contract.test.mjs"],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);

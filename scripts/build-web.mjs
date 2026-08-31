import { copyFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";

await mkdir("public/assets", { recursive: true });

await copyFile(
  "node_modules/jquery/dist/jquery.min.js",
  "public/assets/jquery-3.4.1.min.js",
);

await build({
  entryPoints: ["src/browser.ts"],
  outfile: "public/assets/app.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  sourcesContent: true,
  legalComments: "none",
});

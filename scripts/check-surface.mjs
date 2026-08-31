import { readFile } from "node:fs/promises";

const source = await readFile("src/index.ts", "utf8");
const apiRoutes = [
  ...source.matchAll(
    /app\.(?:get|post|put|delete|all)\(\s*"(\/api\/[^\"]+)/g,
  ),
].map((match) => match[1]);
const unique = [...new Set(apiRoutes)];
if (unique.length >= 20) {
  throw new Error(`API route ceiling exceeded: ${unique.length}`);
}
console.log(`Declared /api route count: ${unique.length}`);

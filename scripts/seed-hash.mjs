import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const bytes = await readFile("migrations/0001_seed.sql");
const hash = createHash("sha256").update(bytes).digest("hex");
console.log(`D1 seed SHA-256: ${hash}`);

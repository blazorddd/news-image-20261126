import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The entry image is drawn at build time (see RESEARCH.md) and stored as
// entry.png next to this file. This program only validates it and copies
// its exact bytes to the output directory, so the run is deterministic.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = new URL("./entry.png", import.meta.url);
const bytes = readFileSync(src);

// PNG magic: 89 50 4E 47
if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
  throw new Error("entry.png is not a PNG");
}
if (bytes.length > 1024 * 1024) throw new Error("entry.png is over 1 MiB");
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) throw new Error("entry.png is over 1024x1024");

mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);
const written = readFileSync(dest);
if (!written.equals(bytes)) throw new Error("output differs from entry.png");
console.log(`wrote ${dest} (${bytes.length} bytes, ${width}x${height})`);

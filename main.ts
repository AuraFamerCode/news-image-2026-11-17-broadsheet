import { readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_BYTES = 1_048_576; // 1 MiB

// PNG signature: 8 bytes  89 50 4E 47 0D 0A 1A 0A
const PNG_SIG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// JPEG signature: starts with FF D8 FF (first 3 bytes; 4th byte varies by JFIF/Exif marker)
const JPEG_SIG = Uint8Array.from([0xff, 0xd8, 0xff]);

function matchesSignature(buf: Uint8Array, sig: Uint8Array): boolean {
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) return false;
  }
  return true;
}

const src = join(__dirname, "entry.png");

// Read the full file (needed for size check and copy)
const data = readFileSync(src);

// --- Validation ---

// 1. Size check
if (data.byteLength > MAX_BYTES) {
  throw new Error(
    `entry.png is ${data.byteLength} bytes, which exceeds the 1 048 576-byte limit.`
  );
}

// 2. Signature check (read first 8 bytes)
const header = data.subarray(0, 8);
if (!matchesSignature(header, PNG_SIG) && !matchesSignature(header, JPEG_SIG)) {
  throw new Error(
    "entry.png does not begin with a valid PNG or JPEG signature."
  );
}

// --- Output ---
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });

const dest = join(outputDir, "entry.png");
copyFileSync(src, dest);

console.log(dest);

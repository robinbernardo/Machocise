#!/usr/bin/env node
/**
 * Copies the MediaPipe Tasks Vision WASM runtime out of node_modules into
 * public/mediapipe/wasm so the pose pipeline is served same-origin instead
 * of depending on a third-party CDN at runtime (see src/lib/pose/poseLandmarker.ts).
 * Not committed to git (generated) -- runs automatically after `npm install`.
 */
import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, "..", "node_modules", "@mediapipe", "tasks-vision", "wasm");
const DEST_DIR = path.join(__dirname, "..", "public", "mediapipe", "wasm");

async function main() {
  await mkdir(DEST_DIR, { recursive: true });
  await cp(SOURCE_DIR, DEST_DIR, { recursive: true });
  console.log(`Copied MediaPipe wasm runtime to ${path.relative(process.cwd(), DEST_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

#!/usr/bin/env node
/**
 * Generates short placeholder feedback tones as WAV files (no external
 * audio tools required). These stand in for the final "correct"/"incorrect"
 * sound effects -- see docs/PLAN.md #6. To use your own sounds later, drop
 * replacement files at public/sounds/correct.wav and public/sounds/incorrect.wav
 * (or update the paths in src/lib/sound/playFeedbackSound.ts).
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "sounds");
const SAMPLE_RATE = 44100;

/**
 * @param {{ frequency: number, durationMs: number, startGain?: number }[]} tones
 */
function synthesize(tones) {
  const samples = [];
  for (const { frequency, durationMs, startGain = 0.5 } of tones) {
    const sampleCount = Math.floor((durationMs / 1000) * SAMPLE_RATE);
    for (let i = 0; i < sampleCount; i++) {
      const t = i / SAMPLE_RATE;
      // Linear fade-out envelope so tones don't click at the end.
      const envelope = startGain * (1 - i / sampleCount);
      samples.push(Math.sin(2 * Math.PI * frequency * t) * envelope);
    }
  }
  return samples;
}

/** @param {number[]} samples */
function encodeWav(samples) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28); // byte rate
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32767), offset);
    offset += bytesPerSample;
  }
  return buffer;
}

async function main() {
  // Correct: a short, bright two-note ascending chime.
  const correct = encodeWav(
    synthesize([
      { frequency: 880, durationMs: 110, startGain: 0.5 },
      { frequency: 1318.5, durationMs: 160, startGain: 0.5 },
    ])
  );

  // Incorrect: a low, brief buzz (two overlapped-in-sequence low tones).
  const incorrect = encodeWav(
    synthesize([
      { frequency: 180, durationMs: 140, startGain: 0.45 },
      { frequency: 140, durationMs: 180, startGain: 0.4 },
    ])
  );

  await writeFile(path.join(OUTPUT_DIR, "correct.wav"), correct);
  await writeFile(path.join(OUTPUT_DIR, "incorrect.wav"), incorrect);
  console.log("Wrote public/sounds/correct.wav and public/sounds/incorrect.wav");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

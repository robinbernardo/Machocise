#!/usr/bin/env node
/**
 * Fetches the exercise catalog from hasaneyldrm/exercises-dataset, trims it
 * to the fields the app uses, tags every exercise with a movement-pattern
 * "archetype" (see docs/PLAN.md #3), and writes the result to
 * src/data/exercises.json. The app never talks to the upstream repo at
 * runtime -- this script is the only place that does.
 *
 * Usage: npm run data:fetch
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "exercises.json");

/** @typedef {import("../src/types/exercise").Archetype} Archetype */

/**
 * Ordered keyword rules. First matching rule wins; falls back to
 * "unclassified" so every exercise still gets generic rep counting.
 * @type {{ archetype: Archetype, test: (haystack: string, raw: Record<string, unknown>) => boolean }[]}
 */
const RULES = [
  {
    archetype: "plank",
    test: (h) =>
      /\bplank\b|\bhold\b|\bwall sit\b|\bhollow\b|\bsuperman\b|\bisometric\b|\bbridge\b/.test(
        h
      ),
  },
  {
    archetype: "lunge",
    test: (h) => /\blunge\b|\bstep-up\b|\bstep up\b|\bbulgarian\b/.test(h),
  },
  {
    archetype: "hinge",
    test: (h) =>
      /\bdeadlift\b|\bhip thrust\b|\bgood morning\b|\bswing\b|\bhyperextension\b|\bglute bridge\b/.test(
        h
      ),
  },
  {
    archetype: "squat",
    test: (h) => /\bsquat\b|\bleg press\b/.test(h),
  },
  {
    archetype: "rotation",
    test: (h) => /\btwist\b|\brotation\b|\bchop\b|\boblique\b/.test(h),
  },
  {
    archetype: "raise",
    test: (h) => /\braise\b|\bfly\b|\bflye\b|\babduction\b/.test(h),
  },
  {
    archetype: "pull",
    test: (h) =>
      /\bcurl\b|\brow\b|\bpull-up\b|\bpull up\b|\bpulldown\b|\bpull down\b|\bchin-up\b|\bchin up\b/.test(
        h
      ),
  },
  {
    archetype: "push",
    test: (h) =>
      /\bpush-up\b|\bpush up\b|\bbench press\b|\bshoulder press\b|\boverhead press\b|\bdip\b|\bchest press\b|\bpress\b/.test(
        h
      ),
  },
  {
    archetype: "cardio",
    test: (h, raw) =>
      raw.category === "cardio" ||
      /\bjump\b|\bjack\b|\bburpee\b|\bsprint\b|\bmountain climber\b|\bhigh knee\b/.test(
        h
      ),
  },
];

/** @param {Record<string, unknown>} raw */
function classifyArchetype(raw) {
  const haystack = [raw.name, raw.category, raw.target, raw.muscle_group]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  for (const rule of RULES) {
    if (rule.test(haystack, raw)) return rule.archetype;
  }
  return "unclassified";
}

async function main() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: ${response.status} ${response.statusText}`);
  }
  /** @type {Record<string, unknown>[]} */
  const raw = await response.json();
  console.log(`Fetched ${raw.length} exercises. Classifying...`);

  const counts = {};
  const exercises = raw.map((entry) => {
    const archetype = classifyArchetype(entry);
    counts[archetype] = (counts[archetype] ?? 0) + 1;

    const instructions = entry.instructions ?? {};
    const instructionSteps = entry.instruction_steps ?? {};

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      bodyPart: entry.body_part,
      equipment: entry.equipment,
      target: entry.target,
      muscleGroup: entry.muscle_group,
      secondaryMuscles: Array.isArray(entry.secondary_muscles)
        ? entry.secondary_muscles
        : [],
      instructions: instructions.en ?? "",
      instructionSteps: Array.isArray(instructionSteps.en) ? instructionSteps.en : [],
      archetype,
    };
  });

  await writeFile(OUTPUT_PATH, `${JSON.stringify(exercises, null, 2)}\n`, "utf8");

  console.log(`Wrote ${exercises.length} exercises to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log("Archetype distribution:");
  for (const [archetype, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${archetype.padEnd(14)} ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

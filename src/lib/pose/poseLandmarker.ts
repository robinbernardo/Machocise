import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from "@mediapipe/tasks-vision";

// Served same-origin from public/mediapipe/wasm (copied out of node_modules
// by scripts/copy-mediapipe-assets.mjs) rather than a third-party CDN, so
// the pose pipeline doesn't depend on jsdelivr's availability.
const WASM_BASE_URL = "/mediapipe/wasm";
const MODEL_ASSET_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

/**
 * Lazily creates (and caches) a single video-mode PoseLandmarker instance.
 * Client-only: pulls in WASM + a ~6MB model over the network the first
 * time it's called, so only call this once a workout actually starts.
 */
export function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_BASE_URL).then((fileset) =>
      PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      })
    );
  }
  return landmarkerPromise;
}

export type { PoseLandmarkerResult };

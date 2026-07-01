/**
 * Named indices into the 33-point landmark array returned by MediaPipe's
 * PoseLandmarker. Only the joints the rep-counting engine cares about are
 * listed here; see
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 * for the full 33-point map.
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export type LandmarkName = keyof typeof POSE_LANDMARKS;

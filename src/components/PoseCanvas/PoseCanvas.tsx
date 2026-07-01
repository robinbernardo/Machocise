"use client";

import { useEffect, useRef } from "react";
import type { Point } from "@/lib/pose/angles";
import { getPoseLandmarker } from "@/lib/pose/poseLandmarker";
import styles from "./PoseCanvas.module.scss";

// Index pairs into the 33-point pose model, just enough to draw a
// recognizable stick-figure overlay (see src/lib/pose/landmarks.ts).
const POSE_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

interface PoseCanvasProps {
  stream: MediaStream;
  onFrame: (landmarks: Point[], timestampMs: number) => void;
}

export function PoseCanvas({ stream, onFrame }: PoseCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId = 0;
    let cancelled = false;
    video.srcObject = stream;

    getPoseLandmarker().then(async (landmarker) => {
      if (cancelled) return;
      await video.play();

      const detect = () => {
        if (cancelled) return;
        if (video.readyState < 2) {
          animationFrameId = requestAnimationFrame(detect);
          return;
        }

        const timestampMs = performance.now();
        const result = landmarker.detectForVideo(video, timestampMs);
        const canvas = canvasRef.current;

        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          const landmarks = result.landmarks[0];
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (landmarks) {
              drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
            }
          }
          if (landmarks) {
            onFrameRef.current(landmarks, timestampMs);
          }
        }

        animationFrameId = requestAnimationFrame(detect);
      };

      animationFrameId = requestAnimationFrame(detect);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [stream]);

  return (
    <div className={styles.wrapper}>
      <video ref={videoRef} className={styles.video} muted playsInline aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.overlay} aria-hidden="true" />
    </div>
  );
}

function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: Point[], width: number, height: number) {
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];
    if (!start || !end) continue;
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }
}

"use client";

import { useCallback, useState, type ReactNode } from "react";
import styles from "./CameraPermissionGate.module.scss";

type CameraStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

interface CameraPermissionGateProps {
  onGranted: (stream: MediaStream) => void;
  children?: ReactNode;
}

export function CameraPermissionGate({ onGranted, children }: CameraPermissionGateProps) {
  const [status, setStatus] = useState<CameraStatus>("idle");

  const requestCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStatus("granted");
      onGranted(stream);
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [onGranted]);

  if (status === "granted") {
    return <>{children}</>;
  }

  return (
    <div className={styles.gate}>
      <h2 className={styles.heading}>Camera access needed</h2>
      <p>
        Machocise watches your movement live to count reps and check your form. Video is
        processed entirely on your device -- nothing is uploaded or recorded.
      </p>
      <button
        type="button"
        className={styles.button}
        onClick={requestCamera}
        disabled={status === "requesting"}
      >
        {status === "requesting" ? "Requesting camera…" : "Enable camera"}
      </button>
      <p role="status" aria-live="polite" className={styles.status}>
        {status === "denied" &&
          "Camera access was denied. Enable camera permissions for this site in your browser settings, then try again."}
        {status === "unsupported" &&
          "Your browser doesn't support camera access. Try a recent version of Chrome, Safari, or Firefox."}
        {status === "error" && "Something went wrong starting the camera. Please try again."}
      </p>
    </div>
  );
}

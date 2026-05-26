import { useCallback, useEffect, useRef, useState } from "react";
import { runOcrOnImage } from "../lib/ocrClient";
import type { VinScanResult } from "../types/vin";

type CameraScannerProps = {
  onScanResult: (result: VinScanResult) => void;
  onScanningChange?: (scanning: boolean) => void;
  onError?: (message: string) => void;
};

export function CameraScanner({
  onScanResult,
  onScanningChange,
  onError,
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    onError?.("");
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        onError?.(
          "No rear camera found — using default camera. Point at the VIN plate.",
        );
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setCameraActive(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        onError?.("Camera permission denied. Allow camera access and try again.");
      } else if (name === "NotFoundError") {
        onError?.("No camera found on this device.");
      } else {
        onError?.(
          err instanceof Error ? err.message : "Could not start camera.",
        );
      }
      stopCamera();
    }
  };

  const captureFrameToCanvas = (): HTMLCanvasElement | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas;
  };

  const captureAndScan = async () => {
    if (!cameraActive) {
      onError?.("Start the camera before capturing a frame.");
      return;
    }

    const frame = captureFrameToCanvas();
    if (!frame) {
      onError?.("Could not capture frame from video.");
      return;
    }

    setBusy(true);
    onScanningChange?.(true);
    onError?.("");

    try {
      const result = await runOcrOnImage(frame);
      onScanResult(result);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "OCR failed on captured frame.",
      );
    } finally {
      setBusy(false);
      onScanningChange?.(false);
    }
  };

  return (
    <section className="card camera-card">
      <h2>Camera</h2>
      <div className="video-wrap">
        <video
          ref={videoRef}
          playsInline
          muted
          className={cameraActive ? "video-active" : "video-idle"}
        />
        {!cameraActive && (
          <p className="video-placeholder">Camera preview will appear here</p>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden-canvas" aria-hidden />

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={startCamera}
          disabled={cameraActive || busy}
        >
          Start Camera
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={captureAndScan}
          disabled={!cameraActive || busy}
        >
          {busy ? "Scanning…" : "Capture / Scan Frame"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={stopCamera}
          disabled={!cameraActive || busy}
        >
          Stop Camera
        </button>
      </div>
    </section>
  );
}

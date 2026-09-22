import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CameraCaptureProps = {
  /** What the player is supposed to point the camera at. */
  title: string;
  subtitle?: string | undefined;
  /** Reference image of the object, shown as a small hint. */
  hint?: string | undefined;
  onCapture: (photo: string) => void;
  onCancel: () => void;
};

type Stage = "live" | "review" | "recognizing";

const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.82;

/** Downscale any image source to a JPEG data URL small enough for localStorage. */
function toJpeg(source: CanvasImageSource, w: number, h: number): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/**
 * Pokémon-Go style capture: live rear camera with a viewfinder frame, snap,
 * review, "recognizing" beat, then the photo becomes the collectible.
 * Falls back to the native camera picker when getUserMedia is unavailable.
 */
export function CameraCapture({ title, subtitle, hint, onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<Stage>("live");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setReady(false);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => undefined);
        setReady(true);
      }
    } catch {
      setError("denied");
    }
  }, []);

  useEffect(() => {
    if (stage === "live") void startStream();
    return stopStream;
  }, [stage, startStream, stopStream]);

  function snap() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const data = toJpeg(v, v.videoWidth, v.videoHeight);
    if (!data) return;
    stopStream();
    setPhoto(data);
    setStage("review");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const data = toJpeg(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      if (!data) return;
      stopStream();
      setPhoto(data);
      setStage("review");
    };
    img.src = url;
  }

  function confirm() {
    if (!photo) return;
    setStage("recognizing");
    // A short "recognition" beat sells the moment; real CV can slot in here later.
    window.setTimeout(() => onCapture(photo), 1400);
  }

  function retake() {
    setPhoto(null);
    setStage("live");
  }

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-ink text-inverse">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-5">
        <button
          onClick={() => {
            stopStream();
            onCancel();
          }}
          aria-label="Close camera"
          className="grid h-10 w-10 place-items-center rounded-full bg-inverse/10"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
            {stage === "review" ? "Looks right?" : stage === "recognizing" ? "Checking" : "Find it"}
          </p>
          <p className="mt-0.5 max-w-[220px] truncate text-sm font-semibold">{title}</p>
        </div>
        {hint ? (
          <img
            src={hint}
            alt=""
            className="h-10 w-10 rounded-lg border border-inverse/20 object-cover"
          />
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>

      {/* viewfinder */}
      <div className="relative mx-5 mt-4 flex-1 overflow-hidden rounded-[28px] bg-black">
        {stage === "live" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : photo ? (
          <img
            src={photo}
            alt="Your capture"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {/* frame corners */}
        <div className="pointer-events-none absolute inset-[12%] rounded-2xl">
          {[
            "-top-px -left-px border-t-2 border-l-2 rounded-tl-2xl",
            "-top-px -right-px border-t-2 border-r-2 rounded-tr-2xl",
            "-bottom-px -left-px border-b-2 border-l-2 rounded-bl-2xl",
            "-bottom-px -right-px border-b-2 border-r-2 rounded-br-2xl",
          ].map((cls) => (
            <span key={cls} className={`absolute h-8 w-8 border-accent ${cls}`} />
          ))}
        </div>

        {stage === "recognizing" ? (
          <div className="absolute inset-0 grid place-items-center bg-ink/55 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <span className="grid h-14 w-14 animate-pulse place-items-center rounded-full bg-accent/20 ring-1 ring-accent/50">
                <ScanLine className="h-6 w-6 text-accent" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                Recognizing…
              </p>
            </div>
            <div className="absolute inset-x-[12%] h-0.5 animate-[scan_1.4s_ease-in-out_infinite] bg-accent/80 shadow-[0_0_16px_var(--accent)]" />
          </div>
        ) : null}

        {stage === "live" && !ready && !error ? (
          <p className="absolute inset-x-0 bottom-5 text-center text-xs text-inverse/70">
            Starting camera…
          </p>
        ) : null}

        {stage === "live" && error ? (
          <div className="absolute inset-0 grid place-items-center px-8 text-center">
            <div>
              <Camera className="mx-auto h-8 w-8 text-inverse/50" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-inverse/80">
                {error === "denied"
                  ? "Camera access is blocked. Allow it, or pick a photo instead."
                  : "No live camera here — pick a photo instead."}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {subtitle ? (
        <p className="mt-3 px-8 text-center text-xs text-inverse/60">{subtitle}</p>
      ) : null}

      {/* controls */}
      <div className="px-5 pb-8 pt-4">
        {stage === "live" ? (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Pick a photo"
              className="grid h-12 w-12 place-items-center rounded-full bg-inverse/10"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <button
              onClick={snap}
              disabled={!ready}
              aria-label="Take photo"
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-inverse/80 bg-inverse/10 active:scale-95 disabled:opacity-40"
            >
              <span className="h-14 w-14 rounded-full bg-accent" />
            </button>
            <span className="h-12 w-12" />
          </div>
        ) : stage === "review" ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="onDark" size="xl" onClick={retake}>
              <RefreshCw className="h-4 w-4" /> Retake
            </Button>
            <Button variant="accent" size="xl" onClick={confirm}>
              Use this photo
            </Button>
          </div>
        ) : (
          <div className="h-14" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}

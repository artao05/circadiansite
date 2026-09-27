"use client";

import { useEffect, useRef, useState } from "react";
import { useCircadianTime } from "./CircadianTimeProvider";

// One photo per master-clock hour, fetched the first time that hour is shown.
function frameSrc(hour: number) {
  return `/day-night/${String(hour).padStart(2, "0")}.webp`;
}

// Draw with "object-fit: cover" math at the canvas's current display size.
function drawCover(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const imgRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;

  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    drawWidth = canvas.height * imgRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    drawHeight = canvas.width / imgRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function DayNightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const shownRef = useRef<HTMLImageElement | null>(null);
  const { hour } = useCircadianTime();
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    const frames = framesRef.current;
    const loadFrame = (target: number) => {
      const key = ((target % 24) + 24) % 24;
      let image = frames.get(key);
      if (!image) {
        image = new Image();
        image.decoding = "async";
        image.src = frameSrc(key);
        frames.set(key, image);
      }
      return image;
    };

    const image = loadFrame(hour);
    let frameId = 0;
    const show = () => {
      const canvas = canvasRef.current;
      if (!canvas || !image.naturalWidth) return;
      frameId = requestAnimationFrame(() => {
        drawCover(canvas, image);
        shownRef.current = image;
        setHasFrame(true);
      });
      // Warm the neighbouring hours so scrubbing stays smooth.
      loadFrame(hour - 1);
      loadFrame(hour + 1);
    };

    if (image.complete) show();
    else image.addEventListener("load", show, { once: true });

    return () => {
      image.removeEventListener("load", show);
      cancelAnimationFrame(frameId);
    };
  }, [hour]);

  // Keep the drawn frame sharp and undistorted when the hero resizes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !("ResizeObserver" in window)) return;

    const observer = new ResizeObserver(() => {
      if (shownRef.current) drawCover(canvas, shownRef.current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="day-night-canvas-wrapper"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: hasFrame ? 0.8 : 0,
        transition: "opacity 1s ease",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {/* Add a subtle dark gradient overlay on top of the canvas to ensure the white hero text remains legible */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
        }}
      />
    </div>
  );
}

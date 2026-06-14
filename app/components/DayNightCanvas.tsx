"use client";

import { useEffect, useRef, useState } from "react";
import { useCircadianTime } from "./CircadianTimeProvider";

// Define the number of frames the user will upload. 
// For a 24-hour cycle, 24, 48, or 120 frames are standard.
const TOTAL_FRAMES = 48; 
const FRAME_DIRECTORY = "/day-night-sequence"; // Folder in /public
const FRAME_PREFIX = "frame_";
const FRAME_EXTENSION = ".jpg";

export function DayNightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hour } = useCircadianTime();
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // 1. Preload the image sequence
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // Format number to 3 digits (e.g., frame_001.jpg)
      const paddedNumber = String(i).padStart(3, "0");
      img.src = `${FRAME_DIRECTORY}/${FRAME_PREFIX}${paddedNumber}${FRAME_EXTENSION}`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      // If an image fails to load (e.g., user hasn't uploaded them yet),
      // we still add it to the array so the index math doesn't break.
      loadedImages.push(img);
    }
    // Avoid calling setState synchronously in an effect
    Promise.resolve().then(() => setImages(loadedImages));
  }, []);

  // 2. Draw the correct frame to the canvas based on masterHour
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;
    
    // Map the 0-24 hour cycle to our frame array (0 to TOTAL_FRAMES - 1)
    const normalizedHour = hour % 24;
    let frameIndex = Math.floor((normalizedHour / 24) * TOTAL_FRAMES);
    
    // Safety clamp
    frameIndex = Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1));
    
    const targetImage = images[frameIndex];
    
    // Only draw if the image has successfully loaded
    if (targetImage && targetImage.complete && targetImage.naturalWidth > 0) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Handle high-DPI (Retina) scaling and cover the whole canvas
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      // Set actual internal canvas resolution to match display size
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Calculate "object-fit: cover" mathematics
      const imgRatio = targetImage.naturalWidth / targetImage.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Image is taller than canvas
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      // Use requestAnimationFrame for buttery smooth drawing
      requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(targetImage, offsetX, offsetY, drawWidth, drawHeight);
      });
    }
  }, [hour, images, imagesLoaded]);

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
        opacity: imagesLoaded > 0 ? 0.8 : 0, 
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

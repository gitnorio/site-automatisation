"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; className?: string };

export function BoomerangVideoBg({ src, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const frames: HTMLCanvasElement[] = [];
    let capturing = true;
    let lastTime = -1;
    let rafId = 0;
    const maxWidth = 960;

    function captureFrame() {
      if (!video || !capturing || video.readyState < 2 || video.currentTime - lastTime < 1 / 30) return;
      lastTime = video.currentTime;
      if (!video.videoWidth || !video.videoHeight) return;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const context = canvas.getContext("2d");
      if (!context) return;
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas);
      }
      catch { capturing = false; }
    }

    function loop() { captureFrame(); if (capturing) rafId = requestAnimationFrame(loop); }
    function onLoaded() { video?.play().catch(() => undefined); rafId = requestAnimationFrame(loop); }
    function onEnded() {
      capturing = false;
      if (frames.length > 1) { framesRef.current = frames; setFramesReady(true); }
      else if (video) { video.currentTime = 0; video.play().catch(() => undefined); }
    }
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("ended", onEnded);
    if (video.readyState >= 1) onLoaded();
    return () => { capturing = false; cancelAnimationFrame(rafId); video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("ended", onEnded); };
  }, [src]);

  useEffect(() => {
    if (!framesReady) return;
    const canvas = displayCanvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = frames[0].width; canvas.height = frames[0].height;
    let index = 0; let direction = 1; let last = performance.now(); let rafId = 0;
    function render(now: number) {
      if (!context) return;
      if (now - last >= 1000 / 30) { last = now; context.drawImage(frames[index], 0, 0); index += direction; if (index >= frames.length - 1) { index = frames.length - 1; direction = -1; } else if (index <= 0) { index = 0; direction = 1; } }
      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [framesReady]);

  return <div className={`boomerang-video ${className}`} aria-hidden="true">
    <video ref={videoRef} src={src} muted playsInline preload="auto" crossOrigin="anonymous" style={{ display: framesReady ? "none" : "block" }} />
    <canvas ref={displayCanvasRef} style={{ display: framesReady ? "block" : "none" }} />
  </div>;
}

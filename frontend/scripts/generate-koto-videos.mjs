import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(scriptDirectory, "..");
const outputDirectory = path.join(frontendDirectory, "public", "videos");

async function dataUrl(filePath, mimeType) {
  const buffer = await readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function recordVideo(page, { source, output, duration, mode }) {
  const downloadPromise = page.waitForEvent("download");
  await page.evaluate(async ({ imageUrl, durationMs, modeName }) => {
    const width = 1280;
    const height = 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponible");

    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm;codecs=vp8";
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_500_000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };

    function cover(progress) {
      const baseScale = Math.max(width / image.width, height / image.height);
      const scale = baseScale * (1.045 + progress * .055);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const driftX = (progress - .5) * 54;
      const driftY = Math.sin(progress * Math.PI) * -16;
      context.drawImage(image, (width - drawWidth) / 2 + driftX, (height - drawHeight) / 2 + driftY, drawWidth, drawHeight);
      const shade = context.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, "rgba(23,17,38,.08)");
      shade.addColorStop(.58, "rgba(23,17,38,.22)");
      shade.addColorStop(1, "rgba(23,17,38,.48)");
      context.fillStyle = shade;
      context.fillRect(0, 0, width, height);
    }

    function product(progress) {
      context.fillStyle = "#f3efff";
      context.fillRect(0, 0, width, height);
      const baseScale = Math.max((width * .92) / image.width, (height * .9) / image.height);
      const focus = progress < .4 ? progress / .4 : progress < .78 ? 1 : 1 - ((progress - .78) / .22) * .35;
      const scale = baseScale * (1 + focus * .22);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const targetX = progress < .4 ? 0 : progress < .72 ? -90 : 35;
      const targetY = progress < .4 ? 0 : progress < .72 ? -95 : -35;
      const x = (width - drawWidth) / 2 + targetX * focus;
      const y = (height - drawHeight) / 2 + targetY * focus;

      context.save();
      context.shadowColor = "rgba(36,27,56,.2)";
      context.shadowBlur = 34;
      context.shadowOffsetY = 18;
      context.beginPath();
      context.roundRect(x, y, drawWidth, drawHeight, 18);
      context.clip();
      context.drawImage(image, x, y, drawWidth, drawHeight);
      context.restore();

      const cursorProgress = Math.min(1, Math.max(0, (progress - .34) / .44));
      if (cursorProgress > 0 && cursorProgress < 1) {
        const cursorX = 870 + Math.sin(cursorProgress * Math.PI) * 150;
        const cursorY = 533 + Math.sin(cursorProgress * Math.PI * .75) * 72;
        context.beginPath();
        context.arc(cursorX, cursorY, 11, 0, Math.PI * 2);
        context.fillStyle = "rgba(40,40,40,.92)";
        context.fill();
        context.beginPath();
        context.arc(cursorX, cursorY, 20, 0, Math.PI * 2);
        context.strokeStyle = "rgba(226,249,231,.95)";
        context.lineWidth = 3;
        context.stroke();
      }
    }

    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    recorder.start(250);
    const startedAt = performance.now();
    await new Promise((resolve) => {
      function frame(now) {
        const elapsed = now - startedAt;
        const progress = Math.min(1, elapsed / durationMs);
        context.clearRect(0, 0, width, height);
        if (modeName === "hero") cover(progress);
        else product(progress);
        if (progress < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    recorder.stop();
    await stopped;

    const blob = new Blob(chunks, { type: mimeType });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${modeName}.webm`;
    anchor.click();
  }, { imageUrl: source, durationMs: duration, modeName: mode });

  const download = await downloadPromise;
  await download.saveAs(output);
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent("<!doctype html><html><body></body></html>");

await recordVideo(page, {
  source: await dataUrl(path.join(frontendDirectory, "public", "images", "editorial", "hero-architecture.webp"), "image/webp"),
  output: path.join(outputDirectory, "koto-hero-loop.webm"),
  duration: 8000,
  mode: "hero",
});

await recordVideo(page, {
  source: await dataUrl(path.join(frontendDirectory, "public", "images", "product", "consultation-marque-blanche-wall-logo-v6.webp"), "image/webp"),
  output: path.join(outputDirectory, "koto-product-demo.webm"),
  duration: 11000,
  mode: "product",
});

await browser.close();

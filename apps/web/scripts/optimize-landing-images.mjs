// One-off: converts the landing source photos (local Downloads) into the
// optimized webp assets committed under public/landing/. Rerun only if the
// source photos change; adjust the input paths to your machine.
import sharp from "sharp";

const jobs = [
  [
    "C:/Users/Usuario/Downloads/ChatGPT Image 11 jul 2026, 17_27_09.png",
    "public/landing/court-line-ball.webp",
    2000,
    80,
  ],
  ["C:/Users/Usuario/Downloads/ryan-searle-qjrjJnFypa0-unsplash.webp", "public/landing/aerial-court.webp", 1200, 80],
  ["C:/Users/Usuario/Downloads/paul-js-h0-mb_0JtvQ-unsplash.jpg", "public/landing/racket-flatlay.webp", 1200, 80],
  ["C:/Users/Usuario/Downloads/wilson-stratton-AldB5IWh8l4-unsplash.jpg", "public/landing/serve.webp", 2000, 78],
  ["C:/Users/Usuario/Downloads/hero-background.webp", "public/landing/night-stadium.webp", 2880, 78],
];

for (const [src, out, width, quality] of jobs) {
  const info = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out);
  console.log(`${out} — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}

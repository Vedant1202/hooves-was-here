import fs from "fs";
import path from "path";
import PasswordGate from "@/components/PasswordGate";
import { basePath } from "@/lib/site";
import type { Slide } from "@/components/Slideshow";

const IMAGE_PATTERN = /^(\d+)\.(png|jpe?g|gif|webp)$/i;
const AUDIO_PATTERN = /\.(mp3|wav|m4a|ogg)$/i;

function loadSlides(): Slide[] {
  const dir = path.join(process.cwd(), "public", "slides");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  return files
    .map((file) => {
      const match = file.match(IMAGE_PATTERN);
      return match ? { file, order: Number(match[1]) } : null;
    })
    .filter((entry): entry is { file: string; order: number } => entry !== null)
    .sort((a, b) => a.order - b.order)
    .map(({ file, order }) => ({
      src: `${basePath}/slides/${file}`,
      alt: `Slide ${order}`,
    }));
}

function loadMusicSrc(): string | null {
  const dir = path.join(process.cwd(), "public", "audio");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return null;
  }

  const match = files.find((file) => AUDIO_PATTERN.test(file));
  return match ? `${basePath}/audio/${match}` : null;
}

export default function Home() {
  const slides = loadSlides();
  const musicSrc = loadMusicSrc();
  return <PasswordGate slides={slides} musicSrc={musicSrc} />;
}

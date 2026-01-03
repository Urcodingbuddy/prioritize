import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const AVATAR_SEEDS = [
  "Felix",
  "Bubbles",
  "Sky",
  "Midnight",
  "Sunset",
  "Daisy",
  "Leo",
  "Luna",
];

export function getAvatarUrl(seed?: string | null) {
  const finalSeed = seed || "default";
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${finalSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

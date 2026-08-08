import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function turnSlug(text: string): string {
  const slug = text.trim().toLowerCase().replaceAll(" ", "-");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `${slug}-${random4}`;
}

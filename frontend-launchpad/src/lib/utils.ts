import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently, resolving conflicts.
 * Essential for building reusable UI components where props might override default styles.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
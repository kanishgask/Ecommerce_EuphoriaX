import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes safely.
 * Solves class conflicts when passing conditional classes to components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

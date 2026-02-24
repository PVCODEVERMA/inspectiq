import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

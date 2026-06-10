/** Resolve a path under `public/` for the current Vite `base` (GitHub Pages subpath). */
export function publicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}

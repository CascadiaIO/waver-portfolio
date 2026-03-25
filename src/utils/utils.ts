// src/utils/utils.ts

/**
 * Converts a public YouTube / Vimeo / Google Drive share URL into a safe
 * embed URL. Returns null for unrecognised or invalid URLs so we never
 * render an arbitrary iframe src.
 */
export function getEmbedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  // YouTube
  if (host === "youtube.com") {
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube.com/embed/${v}`;
  }
  if (host === "youtu.be") {
    const v = u.pathname.slice(1).split("?")[0];
    if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube.com/embed/${v}`;
  }

  // Vimeo
  if (host === "vimeo.com") {
    const v = u.pathname.slice(1).split("/")[0];
    if (v && /^\d+$/.test(v)) return `https://player.vimeo.com/video/${v}`;
  }

  // Google Drive
  if (host === "drive.google.com") {
    const m = u.pathname.match(/\/file\/d\/([\w-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  }

  return null;
}

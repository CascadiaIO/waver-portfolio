import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEntryBySlug } from "@/app/actions";
import { ContentRenderer } from "@/components/ContentRenderer";
import { GalleryGrid } from "@/components/GalleryGrid";
import { EntryHero } from "@/components/EntryHero";
import Link from "next/link";

export const revalidate = 60;

// ---------------------------------------------------------------------------
// SEO / Open Graph
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Not Found" };

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ogImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill/${entry.thumbnail_id}`;

  return {
    title: entry.title,
    description: entry.description ?? undefined,
    openGraph: {
      title: entry.title,
      description: entry.description ?? undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description ?? undefined,
      images: [ogImageUrl],
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a public YouTube / Vimeo / Google Drive share URL into a safe
 * embed URL. Returns null for unrecognised or invalid URLs so we never
 * render an arbitrary iframe src.
 */
function getEmbedUrl(raw: string): string | null {
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  // Gallery images: normalised to 4:3 via Cloudinary so react-photo-album
  // always has correct aspect ratio data.
  const GALLERY_W = 1200;
  const GALLERY_H = 900;
  const galleryPhotos = entry.gallery_ids.map((id) => ({
    src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${GALLERY_W},h_${GALLERY_H},c_fill/${id}`,
    width: GALLERY_W,
    height: GALLERY_H,
    key: id,
    publicId: id,
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero thumbnail */}
      <EntryHero
        thumbnailId={entry.thumbnail_id}
        thumbnailResourceType={entry.thumbnail_resource_type}
        title={entry.title}
        description={entry.description}
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}
      />

      <div className="px-6 pt-12">
        <Link
          href="/"
          className=" text-zinc-500 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      {/* Embedded video */}
      {entry.video_url &&
        (() => {
          const embedUrl = getEmbedUrl(entry.video_url);
          return embedUrl ? (
            <section className="max-w-4xl mx-auto px-6 pt-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-900">
                <iframe
                  src={embedUrl}
                  title={entry.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <a
                  href={entry.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4">
                    <path
                      fillRule="evenodd"
                      d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm6.75-3a.75.75 0 0 1 .75-.75h4.75a.75.75 0 0 1 .75.75v4.75a.75.75 0 0 1-1.5 0V3.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l6.22-6.22H11a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Open video in new tab
                </a>
              </div>
            </section>
          ) : null;
        })()}

      {/* Content (Novel/Tiptap blocks) */}
      {entry.content_json && Object.keys(entry.content_json).length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ContentRenderer content={entry.content_json} />
        </section>
      )}

      {/* Gallery grid */}
      {galleryPhotos.length > 0 && (
        <section className="px-4 pb-12">
          <GalleryGrid photos={galleryPhotos} />
        </section>
      )}

      {/* Back link */}
      {/* <div className="px-6 pb-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-white transition-colors">
          ← Back
        </Link>
      </div> */}
    </main>
  );
}

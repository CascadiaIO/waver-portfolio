import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEntryBySlug } from "@/app/actions";
import { ContentRenderer } from "@/components/ContentRenderer";
import { GalleryGrid } from "@/components/GalleryGrid";
import { EntryHero } from "@/components/EntryHero";

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
      <div className="px-6 pb-12">
        <a
          href="/"
          className="text-sm text-zinc-500 hover:text-white transition-colors">
          ← Back
        </a>
      </div>
    </main>
  );
}

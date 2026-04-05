import { getEntryBySlug } from "@/app/actions";
import { ContentRenderer } from "@/components/ContentRenderer";
import { EntryHero } from "@/components/EntryHero";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getEmbedUrl } from "@/utils/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export { generateMetadata } from "@/utils/metadata";
export const revalidate = 60;

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
      <div className="max-w-[1920px] mx-auto">
        {/* Hero thumbnail */}
        <EntryHero
          thumbnailId={entry.thumbnail_id}
          thumbnailFormat={entry.thumbnail_format}
          thumbnailResourceType={entry.thumbnail_resource_type}
          headerId={entry.header_id}
          headerFormat={entry.header_format}
          animateHeader={entry.animate_header}
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

        {/* Embedded videos */}
        {entry.video_urls.map((url, i) => {
          const embedUrl = getEmbedUrl(url);
          if (!embedUrl) return null;
          return (
            <section key={i} className="max-w-4xl mx-auto px-6 pt-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-900">
                <iframe
                  src={embedUrl}
                  title={`${entry.title}${entry.video_urls.length > 1 ? ` (${i + 1})` : ""}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <a
                  href={url}
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
          );
        })}

        {/* Content (Novel/Tiptap blocks) */}
        {entry.content_json && Object.keys(entry.content_json).length > 0 && (
          <section className="max-w-4xl mx-auto px-6 py-12">
            <ContentRenderer content={entry.content_json} />
          </section>
        )}

        {/* Gallery grid */}
        {galleryPhotos.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 pb-12">
            <GalleryGrid photos={galleryPhotos} />
          </section>
        )}
      </div>
    </main>
  );
}

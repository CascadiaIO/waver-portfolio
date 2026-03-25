// src/utils/metadata.ts
import type { Metadata } from "next";
import { getEntryBySlug } from "@/app/actions";

/**
 * Generates SEO and Open Graph metadata for an entry page.
 * Used in app/[slug]/page.tsx.
 */
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

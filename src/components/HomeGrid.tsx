"use client";

import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import { MediaCard } from "@/components/MediaCard";
import type { Entry } from "@/app/actions";

type GridEntry = Pick<
  Entry,
  | "slug"
  | "title"
  | "thumbnail_id"
  | "thumbnail_resource_type"
  | "thumbnail_format"
  | "category"
  | "width"
  | "height"
>;

interface HomeGridProps {
  entries: GridEntry[];
}

export function HomeGrid({ entries }: HomeGridProps) {
  const photos = entries.map((entry) => ({
    src: entry.thumbnail_id,
    width: entry.width || 16,
    height: entry.height || 9,
    key: entry.slug,
    entry,
  }));

  return (
    <RowsPhotoAlbum
      photos={photos}
      targetRowHeight={380}
      spacing={4}
      rowConstraints={{ minPhotos: 2, maxPhotos: 4 }}
      render={{
        wrapper: (props, { photo }) => (
          <div
            {...props}
            style={{
              ...props.style,
              position: "relative",
              // aspectRatio gives the wrapper an explicit height derived from
              // its CSS-calculated width — mirrors what react-photo-album's
              // default <img aspect-ratio> does, so h-full children resolve.
              aspectRatio: `${photo.width} / ${photo.height}`,
            }}>
            <MediaCard entry={photo.entry} />
          </div>
        ),
      }}
    />
  );
}

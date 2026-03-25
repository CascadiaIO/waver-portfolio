"use client";

import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import { CldImage } from "next-cloudinary";

interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
  key: string;
  publicId: string;
}

interface GalleryGridProps {
  photos: GalleryPhoto[];
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  if (photos.length === 0) return null;

  return (
    <RowsPhotoAlbum
      photos={photos}
      targetRowHeight={320}
      spacing={8}
      render={{
        image: (_props, { photo }) => {
          const p = photo as GalleryPhoto;
          return (
            <CldImage
              src={p.publicId}
              alt={p.publicId}
              width={p.width}
              height={p.height}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          );
        },
      }}
    />
  );
}

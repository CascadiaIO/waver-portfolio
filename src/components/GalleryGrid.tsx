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
        image: (props, { photo }) => (
          <CldImage
            src={(photo as GalleryPhoto).publicId}
            alt={props.alt ?? ""}
            width={props.width as number}
            height={props.height as number}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ),
      }}
    />
  );
}

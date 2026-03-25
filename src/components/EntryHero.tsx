"use client";

import { CldImage } from "next-cloudinary";

interface EntryHeroProps {
  thumbnailId: string;
  thumbnailResourceType: "image" | "video";
  title: string;
  description: string | null;
  cloudName: string;
}

export function EntryHero({
  thumbnailId,
  thumbnailResourceType,
  title,
  description,
  cloudName,
}: EntryHeroProps) {
  return (
    <div className="relative w-full h-[30vh] overflow-hidden">
      {thumbnailResourceType === "video" ? (
        <video
          src={`https://res.cloudinary.com/${cloudName}/video/upload/${thumbnailId}`}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <CldImage
          src={thumbnailId}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg text-zinc-300 max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
}

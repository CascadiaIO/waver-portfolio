/* eslint-disable @next/next/no-img-element */
"use client";

import { CldImage } from "next-cloudinary";

interface EntryHeroProps {
  thumbnailId: string;
  thumbnailResourceType: "image" | "video";
  thumbnailFormat?: string | null;
  headerId?: string | null;
  headerFormat?: string | null;
  animateHeader?: boolean;
  title: string;
  description: string | null;
  cloudName: string;
}

export function EntryHero({
  thumbnailId,
  thumbnailResourceType,
  thumbnailFormat,
  headerId,
  headerFormat,
  animateHeader = false,
  title,
  description,
  cloudName,
}: EntryHeroProps) {
  // Decide which asset to display as the hero
  const useCustomHeader = !!headerId;
  const activeId = useCustomHeader ? headerId! : thumbnailId;
  const activeFormat = useCustomHeader ? headerFormat : thumbnailFormat;
  const isGif = activeFormat?.toLowerCase() === "gif";

  return (
    <div
      className={`relative w-full overflow-hidden${useCustomHeader ? "" : " h-[30vh]"}`}>
      {/* Video thumbnail — only when no custom header overrides it */}
      {!useCustomHeader && thumbnailResourceType === "video" ? (
        <video
          src={`https://res.cloudinary.com/${cloudName}/video/upload/${thumbnailId}`}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : isGif ? (
        <img
          src={
            animateHeader
              ? `https://res.cloudinary.com/${cloudName}/image/upload/${activeId}`
              : `https://res.cloudinary.com/${cloudName}/image/upload/pg_1,f_auto/${activeId}`
          }
          alt={title}
          className={`w-full${useCustomHeader ? " h-auto block" : " h-full object-cover"}`}
        />
      ) : (
        <CldImage
          src={activeId}
          alt={title}
          {...(useCustomHeader
            ? { width: 1920, height: 1080, className: "w-full h-auto" }
            : { fill: true, className: "object-cover" })}
          sizes="(max-width: 1920px) 100vw, 1920px"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-3 md:px-10 md:pb-5">
        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-zinc-300 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

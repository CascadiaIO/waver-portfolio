"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { motion } from "framer-motion";
import type { Entry } from "@/app/actions";

interface MediaCardProps {
  entry: Pick<
    Entry,
    | "slug"
    | "title"
    | "thumbnail_id"
    | "thumbnail_resource_type"
    | "width"
    | "height"
  >;
}

export function MediaCard({ entry }: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isVideo = entry.thumbnail_resource_type === "video";

  const videoSrc = isVideo
    ? `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${entry.thumbnail_id}`
    : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      href={`/${entry.slug}`}
      className="relative block w-full h-full overflow-hidden rounded-sm bg-zinc-900 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <motion.div
        className="absolute inset-0"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3, ease: "easeOut" }}>
        {/* Static thumbnail */}
        <CldImage
          src={entry.thumbnail_id}
          alt={entry.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />

        {/* Video overlay */}
        {isVideo && videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Title overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}>
          <span className="text-white font-medium text-sm leading-tight line-clamp-2">
            {entry.title}
          </span>
        </motion.div>
      </motion.div>
    </Link>
  );
}

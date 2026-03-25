"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveEntry, type Entry } from "@/app/actions";
import { AdminEditor } from "@/components/editor/Editor";

type FormEntry = Omit<Entry, "id" | "created_at"> & { id?: string };

interface EntryFormProps {
  initialData?: Partial<Entry>;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cloudinaryThumbUrl(publicId: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/w_200,h_130,c_fill/${publicId}`;
}

export function EntryForm({ initialData }: EntryFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text fields
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [slugLocked, setSlugLocked] = useState(!!initialData?.slug);

  // Cloudinary fields
  const [thumbnailId, setThumbnailId] = useState(
    initialData?.thumbnail_id ?? "",
  );
  const [thumbnailResourceType, setThumbnailResourceType] = useState<
    "image" | "video"
  >(initialData?.thumbnail_resource_type ?? "image");
  const [thumbnailFormat, setThumbnailFormat] = useState<string>(
    initialData?.thumbnail_format ?? "",
  );
  const [width, setWidth] = useState(initialData?.width ?? 0);
  const [height, setHeight] = useState(initialData?.height ?? 0);
  const [galleryIds, setGalleryIds] = useState<string[]>(
    initialData?.gallery_ids ?? [],
  );

  // Category
  const [category, setCategory] = useState<Entry["category"]>(
    initialData?.category ?? "other",
  );

  // Embedded video link
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url ?? "");

  // Editor content
  const [contentJson, setContentJson] = useState<object>(
    initialData?.content_json ?? {},
  );

  // Upload states
  const [thumbUploading, setThumbUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugLocked) setSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugLocked(true);
    setSlug(val);
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setThumbnailId(json.public_id);
      setThumbnailResourceType(json.resource_type ?? "image");
      setThumbnailFormat(json.format ?? "");
      setWidth(json.width);
      setHeight(json.height);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setThumbUploading(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setGalleryUploading(true);
    setError(null);
    try {
      const uploads = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json();
        return json.public_id as string;
      });
      const newIds = await Promise.all(uploads);
      setGalleryIds((prev) => [...prev, ...newIds]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gallery upload failed");
    } finally {
      setGalleryUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    }
  };

  const removeGalleryImage = (publicId: string) => {
    setGalleryIds((prev) => prev.filter((id) => id !== publicId));
  };

  const handleEditorChange = useCallback((json: object) => {
    setContentJson(json);
  }, []);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!thumbnailId) return setError("A thumbnail image is required.");

    setIsPending(true);
    try {
      const payload: FormEntry = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        title,
        slug,
        description: description || null,
        thumbnail_id: thumbnailId,
        thumbnail_resource_type: thumbnailResourceType,
        thumbnail_format: thumbnailFormat || null,
        video_url: videoUrl.trim() || null,
        category,
        sort_order: initialData?.sort_order ?? 0,
        content_json: contentJson,
        gallery_ids: galleryIds,
        width,
        height,
      };
      await saveEntry(payload);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {error && (
        <div className="rounded-md border border-red-700 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2">
          Basic Info
        </h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-zinc-400">Title *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="My Portfolio Entry"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-zinc-400">
            Slug *{" "}
            <span className="text-zinc-600">(auto-generated from title)</span>
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            placeholder="my-portfolio-entry"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-zinc-400">
            Description{" "}
            <span className="text-zinc-600">(used for SEO / social cards)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none resize-none"
            placeholder="A brief description of this entry..."
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-zinc-400">Category *</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Entry["category"])}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none">
            <option value="wave">Wave</option>
            <option value="game">Game</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-zinc-400">
            Embedded Video Link{" "}
            <span className="text-zinc-600">
              (YouTube, Vimeo, or Google Drive)
            </span>
          </span>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>
      </section>

      {/* Thumbnail */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2">
          Thumbnail *{" "}
          <span className="text-sm font-normal text-zinc-500">
            (shown in the grid — determines aspect ratio)
          </span>
        </h2>
        <div className="flex items-start gap-6">
          {thumbnailId && (
            <div className="flex flex-col gap-1">
              <Image
                src={cloudinaryThumbUrl(thumbnailId)}
                alt="Thumbnail preview"
                width={200}
                height={130}
                className="rounded-md object-cover"
                unoptimized
              />
              <span className="text-xs text-zinc-500">
                {width} × {height}px
              </span>
            </div>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">
              {thumbnailId ? "Replace thumbnail" : "Upload thumbnail"}
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleThumbnailUpload}
              disabled={thumbUploading}
              className="text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:text-zinc-200 hover:file:bg-zinc-600 disabled:opacity-50"
            />
            {thumbUploading && (
              <span className="text-sm text-zinc-500">Uploading…</span>
            )}
          </label>
        </div>
      </section>

      {/* Content editor */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2">
          Content
        </h2>
        <AdminEditor
          initialContent={contentJson}
          onChange={handleEditorChange}
        />
      </section>

      {/* Gallery */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2">
          Gallery Images{" "}
          <span className="text-sm font-normal text-zinc-500">
            (shown at bottom of detail page)
          </span>
        </h2>
        {galleryIds.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {galleryIds.map((id) => (
              <div key={id} className="relative group">
                <Image
                  src={cloudinaryThumbUrl(id)}
                  alt={id}
                  width={120}
                  height={80}
                  className="rounded-md object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(id)}
                  className="absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs hover:bg-red-500"
                  title="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            Add images to gallery (multi-select supported)
          </span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={galleryUploading}
            className="text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:text-zinc-200 hover:file:bg-zinc-600 disabled:opacity-50"
          />
          {galleryUploading && (
            <span className="text-sm text-zinc-500">Uploading…</span>
          )}
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-50 transition-colors">
          {isPending ? "Saving…" : "Save Entry"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

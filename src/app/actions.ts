"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import cloudinary from "@/lib/cloudinary";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Entry = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_id: string;
  thumbnail_resource_type: "image" | "video";
  thumbnail_format: string | null;
  content_json: object;
  gallery_ids: string[];
  width: number;
  height: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Entry[];
}

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Entry;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function saveEntry(
  entry: Omit<Entry, "id" | "created_at"> & { id?: string },
): Promise<Entry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .upsert(entry, { onConflict: "slug" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/${entry.slug}`);

  return data as Entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Cloudinary upload (used by the /api/upload route and admin forms)
// ---------------------------------------------------------------------------

export async function uploadToCloudinary(formData: FormData): Promise<{
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
  width: number;
  height: number;
}> {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "waver-portfolio", resource_type: "auto" },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: (result.resource_type ?? "image") as "image" | "video",
          format: result.format ?? "",
          width: result.width,
          height: result.height,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

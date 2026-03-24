import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/app/actions";

// This route is called by the Novel editor when a user drops/pastes an image.
// It proxies to the same uploadToCloudinary server action and returns the URL
// in the format Novel expects: { url: string }
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    const result = await uploadToCloudinary(formData);
    // Return full result — Novel editor only uses `url`, admin forms use the rest
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

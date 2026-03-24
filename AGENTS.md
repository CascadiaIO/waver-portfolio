AGENT INSTRUCTIONS: NEXT.JS PORTFOLIO CMS

GENERAL NOTES:
Styling Configuration (Tailwind v4):

    No Config File: The project uses Tailwind v4 "CSS-first" mode. Do NOT look for tailwind.config.ts.

    Plugins: Loaded via @plugin in src/app/globals.css.

    Theme Customization: If you need to add custom colors or spacing, do so inside the @theme block in src/app/globals.css using CSS variables (e.g., --color-primary: #hex).

    Typography: The @tailwindcss/typography plugin is already registered. To style the "Headless CMS" content, wrap it in a container with the prose class (e.g., <article className="prose lg:prose-xl">).

1. PROJECT OVERVIEW & STACK

Build a media-heavy portfolio with a "Justified" grid home page and block-based detail pages.

    Framework: Next.js 15+ (App Router, Server Actions).

    Database: Supabase (JSONB for content storage).

    Media: Cloudinary (next-cloudinary).

    Layout: react-photo-album (Rows layout).

    Editor: novel (Tiptap-based).

    Styling: Tailwind CSS + @tailwindcss/typography.

2. DATABASE SCHEMA (SUPABASE SQL)
   SQL

CREATE TABLE entries (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
slug TEXT UNIQUE NOT NULL,
title TEXT NOT NULL,
description TEXT, -- For SEO
thumbnail_id TEXT NOT NULL, -- Cloudinary public_id
content_json JSONB DEFAULT '{}', -- Novel/Tiptap block data
gallery_ids TEXT[] DEFAULT '{}', -- IDs for bottom-of-page grid
width INTEGER NOT NULL, -- Aspect ratio calc
height INTEGER NOT NULL, -- Aspect ratio calc
created_at TIMESTAMPTZ DEFAULT NOW()
);

3. SERVER ACTIONS (app/actions.ts)

Rule: No direct Supabase calls in Client Components.

    getEntries(): Fetch all entries for the main grid.

    getEntryBySlug(slug: string): Fetch single entry for /[slug].

    saveEntry(data: any): Upsert entry. Use revalidatePath('/').

    uploadToCloudinary(file: File): Server-side upload to Cloudinary returning public_id.

4. NOVEL EDITOR CONFIGURATION (ADMIN CMS)

To handle Cloudinary uploads inside the novel editor, implement this custom uploadHandler in the Editor component:
TypeScript

// components/editor/Editor.tsx
import { Editor as NovelEditor } from "novel";

const handleImageUpload = async (file: File) => {
const formData = new FormData();
formData.append("file", file);

// Call a dedicated API route or Server Action
const res = await fetch("/api/upload", { method: "POST", body: formData });
const json = await res.json();

return json.url; // The Cloudinary secure_url
};

export default function AdminEditor({ initialContent, onSave }) {
return (
<NovelEditor
defaultValue={initialContent}
onUpdate={(editor) => onSave(editor.getJSON())}
uploadFn={handleImageUpload}
className="border rounded-lg p-4"
/>
);
}

5. CONTENT RENDERER (components/ContentRenderer.tsx)

Transform the content_json blocks into Tailwind-styled components.

    Text: Map heading nodes to <h2>/<h3>, paragraph to <p>. Wrap the whole output in the prose prose-slate lg:prose-xl class.

    Media: Map image and video nodes to CldImage and CldVideoPlayer from next-cloudinary.

6.  JUSTIFIED GRID & HOVER-TO-PLAY

    Grid: Use RowsPhotoAlbum with targetRowHeight={320} and spacing={16}.

    MediaCard Logic:

        Default: Show CldImage (thumbnail).

        Hover: Overlay a <video> or <CldVideoPlayer> with opacity-100 and trigger .play().

        Ensure playsInline, muted, and loop attributes are set.

7.  DYNAMIC SEO & SOCIALS (app/[slug]/page.tsx)

Implement generateMetadata to fetch the entry and return:
TypeScript

export async function generateMetadata({ params }) {
const entry = await getEntryBySlug(params.slug);
return {
title: entry.title,
description: entry.description,
openGraph: {
images: [{
url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill/${entry.thumbnail_id}`,
width: 1200,
height: 630,
}],
},
};
}

8. EXECUTION ORDER FOR AGENT

   Setup lib/supabase/server.ts and lib/cloudinary.ts.

   Create app/actions.ts for database operations.

   Build the ContentRenderer and JustifiedGrid components.

   Implement the dynamic [slug] page with generateMetadata.

   Create the /admin route with the novel editor and Cloudinary upload handler.

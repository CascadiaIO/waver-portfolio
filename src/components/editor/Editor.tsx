/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  EditorRoot,
  EditorContent,
  EditorBubble,
  EditorBubbleItem,
  StarterKit,
} from "novel";
import Link from "@tiptap/extension-link";

interface AdminEditorProps {
  initialContent?: object;
  onChange: (json: object) => void;
}

const extensions = [
  StarterKit,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
  }),
];

export function AdminEditor({ initialContent, onChange }: AdminEditorProps) {
  const hasContent = initialContent && Object.keys(initialContent).length > 0;

  return (
    <EditorRoot>
      <EditorContent
        initialContent={hasContent ? (initialContent as any) : undefined}
        extensions={extensions}
        onUpdate={({ editor }) => onChange(editor.getJSON())}
        editorProps={{
          attributes: {
            class:
              "outline-none min-h-[350px] prose prose-invert max-w-none focus:outline-none",
          },
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-zinc-100">
        {/* Bubble menu MUST be inside EditorContent */}
        <EditorBubble className="flex items-center gap-1 rounded-lg border border-zinc-600 bg-zinc-800 px-1 py-1 shadow-lg">
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleBold().run()}
            className="cursor-pointer rounded px-2 py-1 text-sm font-bold text-zinc-200 hover:bg-zinc-700 data-active:bg-zinc-700">
            B
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
            className="cursor-pointer rounded px-2 py-1 text-sm italic text-zinc-200 hover:bg-zinc-700 data-active:bg-zinc-700">
            I
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => {
              const existing = editor.getAttributes("link").href as
                | string
                | undefined;
              const url = window.prompt("Enter URL:", existing ?? "https://");
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().unsetLink().run();
              } else {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className="cursor-pointer rounded px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-700 data-active:bg-zinc-700">
            🔗 Link
          </EditorBubbleItem>
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}

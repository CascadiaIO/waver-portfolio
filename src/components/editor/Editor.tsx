"use client";

import { EditorRoot, EditorContent, StarterKit } from "novel";

interface AdminEditorProps {
  initialContent?: object;
  onChange: (json: object) => void;
}

const extensions = [StarterKit];

export function AdminEditor({ initialContent, onChange }: AdminEditorProps) {
  const hasContent = initialContent && Object.keys(initialContent).length > 0;

  return (
    <EditorRoot>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
        className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-zinc-100"
      />
    </EditorRoot>
  );
}

import Link from "next/link";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Entry } from "@/app/actions";

interface SortableRowProps {
  entry: Entry;
  cloud: string;
  reordering: boolean;
}

export function SortableRow({ entry, cloud, reordering }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
      {/* Drag handle — only visible during reorder mode */}
      <td className="px-3 py-3 w-8">
        {reordering && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 touch-none select-none"
            aria-label="Drag to reorder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4">
              <path d="M7 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
          </button>
        )}
      </td>

      <td className="px-4 py-3">
        {entry.thumbnail_id ? (
          <Image
            src={`https://res.cloudinary.com/${cloud}/image/upload/w_80,h_52,c_fill/${entry.thumbnail_id}`}
            alt={entry.title}
            width={80}
            height={52}
            className="rounded object-cover"
            unoptimized
          />
        ) : (
          <div className="h-13 w-20 rounded bg-zinc-800" />
        )}
      </td>

      <td className="px-4 py-3 font-medium text-zinc-100">{entry.title}</td>
      <td className="px-4 py-3 font-mono text-zinc-400">/{entry.slug}</td>
      <td className="px-4 py-3 text-zinc-500">
        {new Date(entry.created_at).toLocaleDateString()}
      </td>

      <td className="px-4 py-3">
        {!reordering && (
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/entries/${entry.slug}/edit`}
              className="text-zinc-300 hover:text-white transition-colors">
              Edit
            </Link>
            <Link
              href={`/${entry.slug}`}
              target="_blank"
              className="text-zinc-500 hover:text-zinc-300 transition-colors">
              View ↗
            </Link>
            <DeleteButton id={entry.id} title={entry.title} />
          </div>
        )}
      </td>
    </tr>
  );
}

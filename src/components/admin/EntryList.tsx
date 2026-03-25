"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateEntryOrder } from "@/app/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Entry } from "@/app/actions";

// ---------------------------------------------------------------------------
// Single sortable row
// ---------------------------------------------------------------------------

function SortableRow({
  entry,
  cloud,
  reordering,
}: {
  entry: Entry;
  cloud: string;
  reordering: boolean;
}) {
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
          <div className="h-[52px] w-20 rounded bg-zinc-800" />
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

// ---------------------------------------------------------------------------
// Main list with reorder mode
// ---------------------------------------------------------------------------

interface EntryListProps {
  initialEntries: Entry[];
  cloud: string;
}

export function EntryList({ initialEntries, cloud }: EntryListProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [reordering, setReordering] = useState(false);
  const [savedEntries, setSavedEntries] = useState(initialEntries);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleEnterReorder = () => {
    setSavedEntries(entries); // snapshot to restore on cancel
    setReordering(true);
  };

  const handleCancel = () => {
    setEntries(savedEntries);
    setReordering(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEntryOrder(entries.map((e) => e.id));
      setSavedEntries(entries);
      setReordering(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEntries((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === active.id);
        const newIndex = prev.findIndex((e) => e.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entries</h1>
        <div className="flex items-center gap-3">
          {reordering ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save Order"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEnterReorder}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors">
                Reorder
              </button>
              <Link
                href="/admin/entries/new"
                className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors">
                + New Entry
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Reorder mode banner */}
      {reordering && (
        <div className="rounded-md border border-amber-700/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-300">
          Drag the{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="inline w-3.5 h-3.5 mx-0.5 -mt-0.5">
            <path d="M7 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
          </svg>{" "}
          handle to reorder entries. Click <strong>Save Order</strong> when done
          or <strong>Cancel</strong> to discard.
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
          <p className="text-zinc-400">No entries yet.</p>
          <Link
            href="/admin/entries/new"
            className="mt-3 inline-block text-sm text-zinc-300 underline hover:text-white">
            Create your first entry
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={entries.map((e) => e.id)}
            strategy={verticalListSortingStrategy}>
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 text-left text-zinc-400">
                  <tr>
                    <th className="px-3 py-3 w-8" />
                    <th className="px-4 py-3 font-medium">Thumbnail</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {entries.map((entry) => (
                    <SortableRow
                      key={entry.id}
                      entry={entry}
                      cloud={cloud}
                      reordering={reordering}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
}

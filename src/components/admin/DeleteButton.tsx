"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry } from "@/app/actions";

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteEntry(id);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors">
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

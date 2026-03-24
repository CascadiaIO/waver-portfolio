import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/app/actions";
import { EntryForm } from "@/components/admin/EntryForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Edit: <span className="text-zinc-400 font-normal">{entry.title}</span>
      </h1>
      <EntryForm initialData={entry} />
    </div>
  );
}

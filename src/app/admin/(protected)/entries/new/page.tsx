import { EntryForm } from "@/components/admin/EntryForm";

export default function NewEntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Entry</h1>
      <EntryForm />
    </div>
  );
}

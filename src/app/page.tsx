export const revalidate = 60;

import { getEntries } from "@/app/actions";
import { HomeGrid } from "@/components/HomeGrid";

export default async function HomePage() {
  const entries = await getEntries();

  if (entries.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-zinc-600 text-sm">No entries yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-2">
      <HomeGrid entries={entries} />
    </main>
  );
}

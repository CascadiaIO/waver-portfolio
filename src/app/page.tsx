export const revalidate = 60;

import { getEntries } from "@/app/actions";
import { HomeGrid } from "@/components/HomeGrid";

import SiteHeader from "@/components/SiteHeader";
import SiteDescription from "@/components/SiteDescription";
import HomeLinksSection from "@/components/HomeLinksSection";

export default async function HomePage() {
  const entries = await getEntries();

  return (
    <main className="min-h-screen bg-background p-2 flex flex-col items-center">
      <SiteHeader name="Your Name" />
      <SiteDescription>Your tagline or description goes here.</SiteDescription>
      <div className="w-full">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center">
            <p className="text-zinc-600 text-sm">No entries yet.</p>
          </div>
        ) : (
          <HomeGrid entries={entries} />
        )}
      </div>
      <HomeLinksSection />
    </main>
  );
}

import { getEntries } from "@/app/actions";
import { EntryList } from "@/components/admin/EntryList";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const entries = await getEntries();
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

  return (
    <div className="flex flex-col gap-6">
      <EntryList initialEntries={entries} cloud={cloud} />
    </div>
  );
}

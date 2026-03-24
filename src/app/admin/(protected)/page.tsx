import Link from "next/link";
import Image from "next/image";
import { getEntries } from "@/app/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const entries = await getEntries();
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entries</h1>
        <Link
          href="/admin/entries/new"
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors">
          + New Entry
        </Link>
      </div>

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
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Thumbnail</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
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
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {entry.title}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-400">
                    /{entry.slug}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

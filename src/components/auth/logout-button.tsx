"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-400 hover:text-zinc-100 transition-colors">
      Log out
    </button>
  );
}

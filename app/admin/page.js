import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { isAuthenticated } from "@/lib/auth";
import { readNotes } from "@/lib/data";
import { appUrl } from "@/lib/utils";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const notes = await readNotes();

  return <AdminPanel initialNotes={notes} appUrl={appUrl()} />;
}

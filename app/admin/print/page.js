import { redirect } from "next/navigation";
import { PrintSheet } from "@/components/print-sheet";
import { isAuthenticated } from "@/lib/auth";
import { readNotes } from "@/lib/data";
import { appUrl } from "@/lib/utils";
import { generateQrDataUrl } from "@/lib/qr";

export default async function PrintPage({ searchParams }) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const params = await searchParams;
  const ids = String(params.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const notes = await readNotes();
  const selectedNotes = notes.filter((note) => ids.includes(note.id));
  const baseUrl = appUrl();

  const qrNotes = await Promise.all(
    selectedNotes.map(async (note) => ({
      ...note,
      qrSrc: await generateQrDataUrl(`${baseUrl}/listen/${note.id}`, 420)
    }))
  );

  return <PrintSheet notes={qrNotes} />;
}

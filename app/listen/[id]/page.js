import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/audio-player";
import { getNoteById } from "@/lib/data";

export default async function ListenPage({ params }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="page-shell listener-shell overflow-x-hidden">
      <section className="listener-card">
        <p className="section-kicker">escucha pública</p>
        <h1>{note.childName}</h1>
        <p>
          Mensaje de voz listo para familia. Usa play para escuchar desde inicio
          o start over para repetir.
        </p>
        <AudioPlayer src={note.audioUrl} />
        <Link href="/" className="nav-link">
          Volver a inicio
        </Link>
      </section>
    </main>
  );
}

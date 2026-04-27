import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { readNotes, upsertNote } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { uploadAudio } from "@/lib/r2";
import { normalizeAudioUpload } from "@/lib/audio";

export async function GET() {
  await requireAuth();
  const notes = await readNotes();
  return NextResponse.json({ notes });
}

export async function POST(request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const childName = String(formData.get("childName") || "").trim();
    const audio = formData.get("audio");

    if (!childName) {
      return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });
    }

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Audio requerido." }, { status: 400 });
    }

    const id = randomUUID();
    const normalizedAudio = await normalizeAudioUpload(audio);
    const upload = await uploadAudio({
      buffer: normalizedAudio.buffer,
      contentType: normalizedAudio.contentType,
      id,
      fileName: normalizedAudio.fileName || `${id}.mp3`,
      childName
    });
    const now = new Date().toISOString();

    const note = await upsertNote({
      id,
      childName,
      audioUrl: upload.url,
      audioKey: upload.key,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo crear registro." },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

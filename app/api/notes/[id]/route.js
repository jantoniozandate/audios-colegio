import { NextResponse } from "next/server";
import { deleteNoteById, getNoteById, upsertNote } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { deleteAudio, uploadAudio } from "@/lib/r2";
import { normalizeAudioUpload } from "@/lib/audio";

export async function PATCH(request, { params }) {
  try {
    await requireAuth();

    const { id } = await params;
    const existing = await getNoteById(id);

    if (!existing) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }

    const formData = await request.formData();
    const childName = String(formData.get("childName") || existing.childName).trim();
    const audio = formData.get("audio");

    let nextAudioUrl = existing.audioUrl;
    let nextAudioKey = existing.audioKey;

    if (audio instanceof File && audio.size > 0) {
      const normalizedAudio = await normalizeAudioUpload(audio);
      const upload = await uploadAudio({
        buffer: normalizedAudio.buffer,
        contentType: normalizedAudio.contentType,
        id,
        fileName: normalizedAudio.fileName || `${id}.mp3`,
        childName
      });

      await deleteAudio(existing.audioKey);
      nextAudioUrl = upload.url;
      nextAudioKey = upload.key;
    }

    const note = await upsertNote({
      ...existing,
      childName,
      audioUrl: nextAudioUrl,
      audioKey: nextAudioKey,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo actualizar registro." },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAuth();

    const { id } = await params;
    const removed = await deleteNoteById(id);

    if (!removed) {
      return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
    }

    await deleteAudio(removed.audioKey);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo eliminar registro." },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

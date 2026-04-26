import { NextResponse } from "next/server";
import { getNoteById, upsertNote } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { uploadAudio } from "@/lib/r2";

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
      const upload = await uploadAudio({
        buffer: Buffer.from(await audio.arrayBuffer()),
        contentType: audio.type || "audio/webm",
        id,
        fileName: audio.name || `${id}.webm`
      });

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

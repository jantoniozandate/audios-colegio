import { getDb } from "@/lib/mongo";
import { publicAudioUrl } from "@/lib/r2";

async function notesCollection() {
  const db = await getDb();
  const collection = db.collection("notes");
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ updatedAt: -1 });
  return collection;
}

function hydrateNote(note) {
  if (!note) {
    return null;
  }

  return {
    ...note,
    audioUrl: note.audioKey ? publicAudioUrl(note.audioKey) : note.audioUrl
  };
}

export async function readNotes() {
  const collection = await notesCollection();
  const notes = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray();

  return notes.map(hydrateNote);
}

export async function upsertNote(note) {
  const collection = await notesCollection();
  await collection.updateOne(
    { id: note.id },
    {
      $set: note
    },
    { upsert: true }
  );

  return note;
}

export async function getNoteById(id) {
  const collection = await notesCollection();
  const note = await collection.findOne(
    { id },
    { projection: { _id: 0 } }
  );

  return hydrateNote(note);
}

export async function deleteNoteById(id) {
  const collection = await notesCollection();
  const removed = await collection.findOneAndDelete(
    { id },
    { projection: { _id: 0 } }
  );

  return hydrateNote(removed);
}

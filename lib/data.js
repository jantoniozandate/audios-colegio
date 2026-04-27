import { getDb } from "@/lib/mongo";

async function notesCollection() {
  const db = await getDb();
  const collection = db.collection("notes");
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ updatedAt: -1 });
  return collection;
}

export async function readNotes() {
  const collection = await notesCollection();
  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray();
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
  return collection.findOne(
    { id },
    { projection: { _id: 0 } }
  );
}

export async function deleteNoteById(id) {
  const collection = await notesCollection();
  return collection.findOneAndDelete(
    { id },
    { projection: { _id: 0 } }
  );
}

import { promises as fs } from "node:fs";
import path from "node:path";

const dataFile = path.join(process.cwd(), "data", "notes.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

export async function readNotes() {
  await ensureFile();
  const raw = await fs.readFile(dataFile, "utf8");
  const notes = JSON.parse(raw);

  return notes.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function writeNotes(notes) {
  await ensureFile();
  await fs.writeFile(dataFile, JSON.stringify(notes, null, 2), "utf8");
}

export async function upsertNote(note) {
  const notes = await readNotes();
  const index = notes.findIndex((item) => item.id === note.id);

  if (index >= 0) {
    notes[index] = note;
  } else {
    notes.push(note);
  }

  await writeNotes(notes);
  return note;
}

export async function getNoteById(id) {
  const notes = await readNotes();
  return notes.find((note) => note.id === id) ?? null;
}

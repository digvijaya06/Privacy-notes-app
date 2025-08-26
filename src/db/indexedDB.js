import { openDB } from "idb";
import { encryptData, decryptData } from "../utils/crypto";  // ✅ use helpers

const DB_NAME = "PrivacyNotesDB";
const NOTES_STORE = "notes";
const SYNC_STORE = "sync_queue";
const METADATA_STORE = "metadata";

export async function initDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "key" });
      }
    },
  });
}

// Save note (encrypt before storing)
export async function saveNote(note, password) {
  const db = await initDB();
  const encrypted = encryptData(note.content, password);   // ✅ use helper

  const storedNote = {
    ...note,
    content: encrypted,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: note.pinned || false,
    archived: note.archived || false,
    synced: false,
  };

  await db.put(NOTES_STORE, storedNote);

  await addToSyncQueue({
    type: "CREATE",
    noteId: storedNote.id,
    note: storedNote,
    timestamp: new Date().toISOString(),
  });

  return storedNote;
}

// Update note
export async function updateNote(id, updates, password) {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (!note) return null;

  let encryptedContent = note.content;
  if (updates.content) {
    encryptedContent = encryptData(updates.content, password);  // ✅ use helper
  }

  const updatedNote = {
    ...note,
    ...updates,
    content: encryptedContent,
    updatedAt: new Date().toISOString(),
    synced: false,
  };

  await db.put(NOTES_STORE, updatedNote);

  await addToSyncQueue({
    type: "UPDATE",
    noteId: id,
    updates: updates,
    timestamp: new Date().toISOString(),
  });

  return updatedNote;
}

// Get all notes (decrypt with password)
export async function getNotes(password) {
  const db = await initDB();
  const allNotes = await db.getAll(NOTES_STORE);

  return allNotes.map((note) => {
    try {
      const decrypted = decryptData(note.content, password);  // ✅ use helper
      return { ...note, content: decrypted };
    } catch (err) {
      return { ...note, content: "Unable to decrypt" };
    }
  });
}

// Delete a note
export async function deleteNote(id) {
  const db = await initDB();

  await addToSyncQueue({
    type: "DELETE",
    noteId: id,
    timestamp: new Date().toISOString(),
  });

  await db.delete(NOTES_STORE, id);
}

// --- Sync Queue ---
export async function addToSyncQueue(operation) {
  const db = await initDB();
  await db.put(SYNC_STORE, operation);
}

export async function getSyncQueue() {
  const db = await initDB();
  return await db.getAll(SYNC_STORE);
}

export async function clearSyncQueue() {
  const db = await initDB();
  const tx = db.transaction(SYNC_STORE, "readwrite");
  await tx.objectStore(SYNC_STORE).clear();
  await tx.done;
}

export async function removeFromSyncQueue(id) {
  const db = await initDB();
  await db.delete(SYNC_STORE, id);
}

// --- Metadata ---
export async function setLastSyncTimestamp(timestamp) {
  const db = await initDB();
  await db.put(METADATA_STORE, { key: "lastSync", value: timestamp });
}

export async function getLastSyncTimestamp() {
  const db = await initDB();
  const metadata = await db.get(METADATA_STORE, "lastSync");
  return metadata ? metadata.value : null;
}

export async function setOnlineStatus(online) {
  const db = await initDB();
  await db.put(METADATA_STORE, { key: "online", value: online });
}

export async function getOnlineStatus() {
  const db = await initDB();
  const metadata = await db.get(METADATA_STORE, "online");
  return metadata ? metadata.value : false;
}

// --- Sync flag ---
export async function markNoteAsSynced(noteId) {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, noteId);
  if (note) {
    note.synced = true;
    await db.put(NOTES_STORE, note);
  }
}

// --- Backup ---
export async function exportBackup() {
  const db = await initDB();
  const allNotes = await db.getAll(NOTES_STORE);

  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    notes: allNotes,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  return new Blob([jsonString], { type: "application/json" });
}

export async function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        if (!backup.notes || !Array.isArray(backup.notes)) {
          reject(new Error("Invalid backup format"));
          return;
        }

        const db = await initDB();

        for (const note of backup.notes) {
          const importedNote = {
            ...note,
            id: undefined,
            createdAt: note.createdAt || new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
            pinned: note.pinned || false,
            archived: note.archived || false,
            synced: false,
          };

          await db.put(NOTES_STORE, importedNote);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

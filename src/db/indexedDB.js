import { openDB } from "idb";
import CryptoJS from "crypto-js";

const DB_NAME = "PrivacyNotesDB";
const STORE_NAME = "notes";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

// Save note (encrypt before storing)
export async function saveNote(note, password) {
  const db = await initDB();
  const encrypted = CryptoJS.AES.encrypt(note.content, password).toString();
  const storedNote = {
    ...note,
    content: encrypted,
    createdAt: new Date().toISOString(),
     pinned: note.pinned || false,
    archived: note.archived || false,
  };
  await db.put(STORE_NAME, storedNote);
  return storedNote;
}
// Update note (pin/archive)
export async function updateNote(id, updates) {
  const db = await initDB();
  const note = await db.get(STORE_NAME, id);
  if (!note) return null;
  const updatedNote = { ...note, ...updates };
  await db.put(STORE_NAME, updatedNote);
  return updatedNote;
}
// Get all notes (decrypt with password)
export async function getNotes(password) {
  const db = await initDB();
  
  const allNotes = await db.getAll(STORE_NAME);
  return allNotes.map(note => {
    try {
      const bytes = CryptoJS.AES.decrypt(note.content, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return { ...note, content: decrypted };
    } catch (err) {
      return { ...note, content: "Unable to decrypt" };
    }
  });
}

// Delete a note
export async function deleteNote(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

// Export all notes as JSON blob
export async function exportBackup() {
  const db = await initDB();
  const allNotes = await db.getAll(STORE_NAME);
  
  // Create a backup object with metadata
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: allNotes
  };
  
  const jsonString = JSON.stringify(backup, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

// Import notes from backup file
export async function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        
        // Validate backup structure
        if (!backup.notes || !Array.isArray(backup.notes)) {
          reject(new Error('Invalid backup format'));
          return;
        }
        
        const db = await initDB();
        
        // Import each note
        for (const note of backup.notes) {
          // Ensure required fields are present
          const importedNote = {
            ...note,
            id: undefined, // Let IndexedDB assign new IDs to avoid conflicts
            createdAt: note.createdAt || new Date().toISOString(),
            pinned: note.pinned || false,
            archived: note.archived || false
          };
          
          await db.put(STORE_NAME, importedNote);
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

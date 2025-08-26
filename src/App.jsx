import React, { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import NotesApp from "./components/NotesApp";
import ArchivedNotes from "./components/ArchivedNotes";
import LockScreen from "./components/LockScreen";
import UnlockedScreen from "./components/UnlockedScreen";
import { saveNote, updateNote, deleteNote, getNotes } from "./db/indexedDB";
import syncManager from "./services/syncManager";
import {
  STORAGE_KEY,
  AUTO_LOCK_MS,
  encryptJson,
  decryptJson,
} from "./utils/crypto";

export default function App() {
  // LOCK STATE
  const [locked, setLocked] = useState(true);
  const [hasVault, setHasVault] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [notes, setNotes] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [user, setUser] = useState(null); // User state for authentication
  const [darkMode, setDarkMode] = useState(true); // Dark mode state

  const lastActivityRef = useRef(Date.now());
  const activityHandler = () => (lastActivityRef.current = Date.now());

  const handleLogin = async (u) => {
    setUser(u);
    // Initialize sync manager with user ID
    syncManager.initialize(u.uid, () => {
      console.log("Sync completed");
    });

    // Load notes from IndexedDB (offline-first)
    const localNotes = await getNotes(password);
    setNotes(localNotes);

    // Trigger sync to get latest from Firestore
    if (navigator.onLine) {
      syncManager.manualSync();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setNotes([]);
    syncManager.destroy();
  };

  useEffect(() => {
    const payload = localStorage.getItem(STORAGE_KEY);
    setHasVault(!!payload);
  }, []);

  useEffect(() => {
    if (!locked) {
      const id = setInterval(() => {
        if (Date.now() - lastActivityRef.current > AUTO_LOCK_MS) {
          handleLock();
        }
      }, 5_000);
      const handlers = [
        "mousemove",
        "keydown",
        "click",
        "scroll",
        "touchstart",
      ];
      handlers.forEach((evt) => window.addEventListener(evt, activityHandler));

      return () => {
        clearInterval(id);
        handlers.forEach((evt) =>
          window.removeEventListener(evt, activityHandler)
        );
      };
    }
  }, [locked]);

  const handleUnlock = async () => {
    try {
      const payloadStr = localStorage.getItem(STORAGE_KEY);

      // First-time setup: no vault yet -> create it with empty notes
      if (!payloadStr) {
        const samplePassword = "TestPassword123";
        const sampleConfirmPw = "TestPassword123";

        if (samplePassword.length < 6) {
          alert("Master password must be at least 6 characters.");
          return;
        }
        if (samplePassword !== sampleConfirmPw) {
          alert("Passwords do not match.");
          return;
        }
        const encrypted = await encryptJson([], password);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
        setNotes([]);
        setLocked(false);
        setHasVault(true);
        lastActivityRef.current = Date.now();
        setConfirmPw("");
        return;
      }

      // Existing vault -> try decrypt with entered password
      const payload = JSON.parse(payloadStr);
      const decrypted = await decryptJson(payload, password);
      setNotes(Array.isArray(decrypted) ? decrypted : []);
      setLocked(false);
      lastActivityRef.current = Date.now();
    } catch (e) {
      console.error(e);
      alert("Invalid password or corrupted vault.");
    }
  };

  const handleLock = () => {
    setNotes([]);
    setShowArchived(false);
    setLocked(true);
    setPassword("");
    setConfirmPw("");
  };

  const toggleShowArchived = () => {
    setShowArchived((prev) => !prev);
  };

  const toggleArchive = async (id) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await updateNote(id, { archived: !note.archived }, password);
      const updatedNotes = await getNotes(password);
      setNotes(updatedNotes);
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    const updatedNotes = await getNotes(password);
    setNotes(updatedNotes);
  };

  const editNote = async (noteId, updates) => {
    await updateNote(noteId, updates, password);
    const updatedNotes = await getNotes(password);
    setNotes(updatedNotes);
  };

  const addNote = async (noteData) => {
    await saveNote(noteData, password);
    const updatedNotes = await getNotes(password);
    setNotes(updatedNotes);
  };

  const exportBackup = () => {
    const payloadStr = localStorage.getItem(STORAGE_KEY);
    if (!payloadStr) return alert("No vault to export.");
    const blob = new Blob([payloadStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "privacy-notes-encrypted.json",
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj.ciphertext || !obj.iv || !obj.salt) {
          alert("Invalid backup file.");
          return;
        }
        localStorage.setItem(STORAGE_KEY, reader.result);
        alert("Backup imported. App will lock — unlock with its password.");
        handleLock();
        setHasVault(true);
      } catch {
        alert("Failed to import backup.");
      }
    };
    reader.readAsText(file);
  };

  if (locked) {
    return (
      <LockScreen
        hasVault={hasVault}
        onUnlock={handleUnlock}
        password={password}
        setPassword={setPassword}
        confirmPw={confirmPw}
        setConfirmPw={setConfirmPw}
      />
    );
  }

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } bg-gray-900 text-white min-h-screen`}
    >
      <Navbar
        onImport={importBackup}
        onExport={exportBackup}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <div className="flex flex-col items-center justify-center h-full p-4">
        {showArchived ? (
          <ArchivedNotes
            archivedNotes={notes.filter((note) => note.archived)}
            onUnarchive={toggleArchive}
            onDelete={handleDeleteNote}
            onEdit={editNote}
          />
        ) : (
          <NotesApp
            notes={notes}
            onAddNote={addNote}
            onUpdateNote={editNote}
            onDeleteNote={handleDeleteNote}
            onToggleArchive={toggleArchive}
            onTogglePin={editNote}
            showArchived={showArchived}
          />
        )}
      </div>
    </div>
  );
}

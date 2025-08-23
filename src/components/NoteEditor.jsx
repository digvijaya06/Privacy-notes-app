import { useState } from "react";
import { saveNote } from "../db/indexedDB.js";

export default function NoteEditor({ addNote, password }) {
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!content) return;
    const note = await saveNote({ content }, password);
    addNote(note);
    setContent("");
  };

  return (
    <div className="mb-4">
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={5}
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleSave}
      >
        Save Note
      </button>
    </div>
  );
}

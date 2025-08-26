import { useState } from "react";
import { saveNote } from "../db/indexedDB.js";

export default function NoteEditor({ addNote, password }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const note = await saveNote({ content }, password);
      addNote(note);         // update parent state
      setContent("");        // clear editor AFTER save
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setSaving(false);
    }
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
        className={`px-4 py-2 rounded text-white ${
          saving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
}

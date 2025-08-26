import React, { useState } from "react";
import { Search } from "lucide-react";
import Note from "./Note";

export default function NotesApp({ 
  notes, 
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onToggleArchive,
  onTogglePin,
  showArchived 
}) {
  // Local state for inputs
  const [input, setInput] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  // Add new note
  const addNote = () => {
    if (!input.trim()) return;
    const newNote = { text: input, tags: splitTags(tags), archived: false };
    onAddNote(newNote);
    setInput("");
    setTags("");
  };

  const toggleArchive = (id) => {
    onToggleArchive(id);
  };

  const deleteNote = (id) => {
    onDeleteNote(id);
  };

  const togglePin = (id) => {
    onTogglePin(id, { pinned: !notes.find(n => n.id === id)?.pinned });
  };

  const editNote = (noteId, updates) => {
    onUpdateNote(noteId, updates);
  };

  const splitTags = (t) =>
    t
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.text.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
    if (!showArchived && note.archived) return false; // hide archived if not showing
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Add Note */}
      <div className="space-y-3">
        <textarea
          className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Write your note in **Markdown**..."
          rows="3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          className="w-full p-2 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button
          onClick={addNote}
          className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition transform hover:scale-105"
        >
          Save Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input
          className="w-full pl-10 p-2 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Search notes by text or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            📓 No notes found. Try adding one above!
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Note 
              key={note.id} 
              note={note} 
              onPin={togglePin} 
              onArchive={toggleArchive} 
              onDelete={deleteNote} 
              onEdit={editNote} 
            />
          ))
        )}
      </div>
    </div>
  );
}

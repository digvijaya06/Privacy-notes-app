import React from "react";
import ReactMarkdown from 'react-markdown';
import { Search, Archive, Trash2 } from "lucide-react";

export default function NotesApp({ 
  notes, 
  setNotes, 
  input, 
  setInput, 
  tags, 
  setTags, 
  search, 
  setSearch, 
  showArchived 
}) {
  // Add new note
  const addNote = () => {
    if (!input.trim()) return;
    setNotes((prev) => [
      { id: Date.now(), text: input, tags: splitTags(tags), archived: false },
      ...prev,
    ]);
    setInput("");
    setTags("");
  };

  const toggleArchive = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
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
    if (!showArchived && note.archived) return false;
    return matchesSearch;
  });

  const tagColors = [
    "bg-pink-500/20 text-pink-300",
    "bg-green-500/20 text-green-300",
    "bg-blue-500/20 text-blue-300",
    "bg-purple-500/20 text-purple-300",
    "bg-yellow-500/20 text-yellow-300",
  ];

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
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <p className="text-gray-400 text-center">
            📓 No notes found. Try adding one above!
          </p>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-gray-700/70 rounded-lg shadow-md hover:shadow-lg transition relative"
            >
              <div
                className={`prose prose-invert max-w-none ${
                  note.archived ? "line-through text-gray-400" : ""
                }`}
              >
                <ReactMarkdown>{note.text}</ReactMarkdown>
              </div>

              {note.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {note.tags.map((tag, i) => (
                    <span
                      key={`${note.id}-tag-${i}`}
                      className={`px-2 py-1 text-xs rounded-md ${
                        tagColors[i % tagColors.length]
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggleArchive(note.id)}
                  className="p-2 bg-gray-600 rounded-full hover:bg-gray-500"
                  title={note.archived ? "Unarchive" : "Archive"}
                >
                  <Archive className="w-4 h-4 text-yellow-400" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

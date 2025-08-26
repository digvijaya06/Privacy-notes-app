import React, { useState } from "react";

const COLORS = ["#fef2f2", "#eff6ff", "#ecfdf5", "#fff7ed", "#f5f3ff", "#fafaf9"];

export default function AddNote({ onSaved }) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [tags, setTags] = useState("");

  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSaved({
      content,
      color,
      tags: tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      pinned: false,
      archived: false,
    });
    setContent("");
    setTags("");
    setColor(COLORS[0]);
  };

  return (
    <form onSubmit={handleSaveClick} className="mb-4 p-4 bg-white rounded-lg shadow">
     
      <textarea
        className="w-full p-3 border rounded mb-2"
        rows={5}
        placeholder="Write your note in **Markdown**…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-600">Color:</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: c, outline: color === c ? "2px solid #111" : "none" }}
            aria-label={`Pick color ${c}`}
          />
        ))}
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Save note
      </button>
    </form>
  );
}

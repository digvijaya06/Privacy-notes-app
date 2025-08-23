import React from "react";
import ReactMarkdown from "react-markdown";

export default function Note({ note }) {
  return (
    <div className="p-5 rounded-xl shadow-md bg-gray-800 border border-gray-700 hover:shadow-xl hover:scale-[1.02] transition">
      <p className="text-gray-200 text-sm mb-4 whitespace-pre-line">
        {note.content}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{note.tags?.length ? "🏷️ " + note.tags.join(", ") : ""}</span>
        <span>{new Date(note.date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}


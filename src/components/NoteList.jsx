import React, { useEffect, useMemo, useState } from "react";
import Note from "./Note";
import { getNotes, deleteNote, updateNote } from "../db/indexedDB";

export default function NoteList({ password, refreshKey, showArchived }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getNotes(password);
      setItems(data);
    })();
  }, [password, refreshKey]);

  const tags = useMemo(() => {
    const t = new Set();
    items.forEach(n => (n.tags || []).forEach(x => t.add(x)));
    return Array.from(t).sort();
  }, [items]);

  const list = useMemo(() => {
    return items
      .filter(n => (showArchived ? n.archived : !n.archived))
      .filter(n =>
        q.trim()
          ? (n.content || "").toLowerCase().includes(q.toLowerCase())
          : true
      )
      .filter(n => (tagFilter ? (n.tags || []).includes(tagFilter) : true))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [items, q, tagFilter, showArchived]);

  const handleDelete = async (id) => {
    await deleteNote(id);
    setItems(items.filter(n => n.id !== id));
  };

  const togglePin = async (note) => {
    const updated = await updateNote(note.id, { pinned: !note.pinned }, password);
    setItems(items.map(n => (n.id === note.id ? { ...n, pinned: updated.pinned } : n)));
  };

  const toggleArchive = async (note) => {
    const updated = await updateNote(note.id, { archived: !note.archived }, password);
    setItems(items.map(n => (n.id === note.id ? { ...n, archived: updated.archived } : n)));
  };

  const handleEdit = async (note) => {
    const edited = prompt("Edit note (Markdown):", note.content);
    if (edited == null) return;
    await updateNote(note.id, { content: edited }, password);
    setItems(items.map(n => (n.id === note.id ? { ...n, content: edited, updatedAt: new Date().toISOString() } : n)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <input
          className="border p-2 rounded w-full md:max-w-sm"
          placeholder="Search notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2 rounded md:w-56"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="text-gray-500">No notes match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(n => (
            <Note
              key={n.id}
              note={n}
              onDelete={handleDelete}
              onPin={togglePin}
              onArchive={toggleArchive}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useRef } from "react";
import { Unlock, Upload, Download, EyeOff, Eye } from "lucide-react";
import NotesApp from "./NotesApp";

export default function UnlockedScreen({ 
  notes, 
  setNotes, 
  input, 
  setInput, 
  tags, 
  setTags, 
  search, 
  setSearch, 
  showArchived, 
  setShowArchived, 
  onLock,
  onExportBackup,
  onImportBackup 
}) {
  const fileRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-pink-500 h-1 rounded-t-xl mb-6"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Unlock className="text-yellow-400" size={26} />
            <h1 className="text-3xl font-bold">Privacy Notes</h1>
          </div>
          <button
            onClick={onLock}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            title="Lock now"
          >
            Lock
          </button>
        </div>
        <p className="text-gray-400">Secure & Encrypted Note-Taking App</p>

        {/* Backup & Options */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            <Download className="w-4 h-4" /> Export Encrypted Backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            <Upload className="w-4 h-4" /> Import Encrypted Backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportBackup}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="accent-yellow-400"
            />
            Show archived
          </label>
        </div>

        {/* Notes App Component */}
        <NotesApp 
          notes={notes}
          setNotes={setNotes}
          input={input}
          setInput={setInput}
          tags={tags}
          setTags={setTags}
          search={search}
          setSearch={setSearch}
          showArchived={showArchived}
        />
      </div>
    </div>
  );
}

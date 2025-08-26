import React from "react";
import ReactMarkdown from "react-markdown";
import { Pin, Archive, Trash2, Edit } from "lucide-react";
import PropTypes from "prop-types";

export default function Note({ note, onPin, onArchive, onDelete, onEdit }) {
  // Handle cases where note might be undefined or missing properties
  if (!note) {
    return (
      <div className="w-80 min-h-[150px] bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 m-3 
                      flex flex-col justify-between">
        <div className="text-gray-500 text-center">Note not available</div>
      </div>
    );
  }

  const { text, content, archived, pinned, tags, id, date } = note;

  // Get the note content - prefer text over content for backward compatibility
  const noteContent = text || content || "";

  // Get the date - prefer date property over id
  const noteDate = date || id;

  return (
    <div className="w-80 min-h-[150px] bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 m-3 
                    flex flex-col justify-between transition hover:shadow-2xl hover:scale-[1.02]">
      
      {/* Top Section */}
      <div className="flex justify-between items-start">
        {/* Content */}
        <div
          className={`prose max-w-none text-gray-800 dark:prose-invert ${
            archived ? "line-through text-gray-400" : ""
          }`}
        >
          <ReactMarkdown>{noteContent}</ReactMarkdown>
        </div>

        {/* Pin indicator */}
        <button
          onClick={() => onPin && onPin(id)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title={pinned ? "Unpin" : "Pin"}
        >
          <Pin
            className={`w-5 h-5 ${
              pinned
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-500 dark:text-gray-300"
            }`}
          />
        </button>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Section */}
      <div className="mt-4 flex justify-between items-center">
        {/* Date */}
        <span className="text-xs text-gray-500">
          {noteDate ? new Date(noteDate).toLocaleDateString() : "No date"}
        </span>

        {/* Action buttons */}
        <div className="flex gap-2">
          {archived ? (
            <>
              {/* Unarchive */}
              <button
                onClick={() => onArchive && onArchive(id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Unarchive"
              >
                <Archive className="w-4 h-4 text-yellow-500" />
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete && onDelete(id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          ) : (
            <>
              {/* Pin */}
              <button
                onClick={() => onPin && onPin(id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title={pinned ? "Unpin" : "Pin"}
              >
                <Pin
                  className={`w-4 h-4 ${
                    pinned
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                />
              </button>

              {/* Archive */}
              <button
                onClick={() => onArchive && onArchive(id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Archive"
              >
                <Archive className="w-4 h-4 text-yellow-500" />
              </button>

              {/* Edit */}
              <button
                onClick={() => onEdit && onEdit(note)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-blue-500" />
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete && onDelete(id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Note.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    content: PropTypes.string,
    archived: PropTypes.bool,
    pinned: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
  onPin: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

Note.defaultProps = {
  note: {},
  onPin: () => {},
  onArchive: () => {},
  onDelete: () => {},
  onEdit: () => {},
};

"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { Todo } from "@/lib/types";
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASSES, nextPriority } from "@/lib/priority";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEditTitle: (id: string, title: string) => void;
  onEditDueDate: (id: string, dueDate: string | null) => void;
  onEditPriority: (id: string, priority: Todo["priority"]) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectToggle?: (id: string) => void;
}

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  const today = new Date().toISOString().slice(0, 10);
  return todo.dueDate < today;
}

function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEditTitle,
  onEditDueDate,
  onEditPriority,
  selectionMode = false,
  selected = false,
  onSelectToggle,
}: TodoItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(todo.title);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const overdue = isOverdue(todo);

  function startEditingTitle() {
    setTitleDraft(todo.title);
    setIsEditingTitle(true);
  }

  function commitTitle() {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== todo.title) {
      onEditTitle(todo.id, trimmed);
    }
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      setTitleDraft(todo.title);
      setIsEditingTitle(false);
    }
  }

  return (
    <li className="group flex flex-wrap items-center gap-3 px-1 py-3">
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelectToggle?.(todo.id)}
          aria-label={`Select "${todo.title}"`}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-indigo-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50 dark:border-indigo-600 dark:bg-zinc-800"
        />
      )}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? `Mark "${todo.title}" as active` : `Mark "${todo.title}" as complete`}
        className="h-5 w-5 shrink-0 cursor-pointer rounded border-zinc-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50 dark:border-zinc-600 dark:bg-zinc-800"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleDraft}
              autoFocus
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              className="min-w-0 flex-1 rounded border border-indigo-400 bg-white px-1.5 py-0.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-zinc-800 dark:text-zinc-100"
            />
          ) : (
            <span
              onDoubleClick={startEditingTitle}
              title="Double-click to edit"
              className={`min-w-0 cursor-text break-words text-zinc-900 dark:text-zinc-100 ${
                todo.completed ? "text-zinc-400 line-through dark:text-zinc-500" : ""
              }`}
            >
              {todo.title}
            </span>
          )}

          <button
            type="button"
            onClick={() => onEditPriority(todo.id, nextPriority(todo.priority))}
            title="Click to change priority"
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${PRIORITY_BADGE_CLASSES[todo.priority]}`}
          >
            {PRIORITY_LABELS[todo.priority]}
          </button>
        </div>

        {isEditingDate ? (
          <input
            type="date"
            value={todo.dueDate ?? ""}
            autoFocus
            onChange={(event) => {
              onEditDueDate(todo.id, event.target.value || null);
              setIsEditingDate(false);
            }}
            onBlur={() => setIsEditingDate(false)}
            className="mt-1 rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:[color-scheme:dark]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingDate(true)}
            className={`mt-0.5 block text-xs transition-colors hover:underline ${
              overdue
                ? "font-medium text-red-500"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {todo.dueDate
              ? `${overdue ? "Overdue: " : "Due "}${formatDueDate(todo.dueDate)}`
              : "+ Add due date"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="shrink-0 rounded p-1.5 text-zinc-400 opacity-100 transition-opacity hover:text-red-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482 41.03 41.03 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}

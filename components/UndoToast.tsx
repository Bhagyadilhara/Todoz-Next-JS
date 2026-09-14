import type { Todo } from "@/lib/types";

interface UndoToastProps {
  pendingDeletions: Todo[];
  onUndo: (id: string) => void;
}

export default function UndoToast({ pendingDeletions, onUndo }: UndoToastProps) {
  if (pendingDeletions.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {pendingDeletions.map((todo) => (
        <div
          key={todo.id}
          role="status"
          className="flex max-w-sm items-center gap-3 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        >
          <span className="min-w-0 truncate">Deleted &ldquo;{todo.title}&rdquo;</span>
          <button
            type="button"
            onClick={() => onUndo(todo.id)}
            className="shrink-0 rounded font-medium text-indigo-300 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:text-indigo-600"
          >
            Undo
          </button>
        </div>
      ))}
    </div>
  );
}

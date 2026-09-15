interface BulkActionBarProps {
  count: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onComplete: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function BulkActionBar({
  count,
  allSelected,
  onToggleSelectAll,
  onComplete,
  onActivate,
  onDelete,
  onCancel,
}: BulkActionBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950/40">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="h-4 w-4 cursor-pointer rounded border-indigo-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50"
        />
        {count} selected
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onComplete}
          disabled={count === 0}
          className="rounded-md px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          Complete
        </button>
        <button
          type="button"
          onClick={onActivate}
          disabled={count === 0}
          className="rounded-md px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          Mark active
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={count === 0}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

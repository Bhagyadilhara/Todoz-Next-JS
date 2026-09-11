import type { TodoFilter as TodoFilterValue } from "@/lib/types";

interface TodoFilterProps {
  filter: TodoFilterValue;
  onChange: (filter: TodoFilterValue) => void;
}

const FILTERS: { value: TodoFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function TodoFilter({ filter, onChange }: TodoFilterProps) {
  return (
    <div role="group" aria-label="Filter todos" className="flex gap-1">
      {FILTERS.map(({ value, label }) => {
        const isActive = value === filter;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

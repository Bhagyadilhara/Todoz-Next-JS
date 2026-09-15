"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TodoFilter as TodoFilterValue, TodoSort } from "@/lib/types";
import { useTodos } from "@/hooks/useTodos";
import { PRIORITY_ORDER } from "@/lib/priority";
import TodoInput from "./TodoInput";
import TodoFilter from "./TodoFilter";
import TodoList from "./TodoList";
import TodoStats from "./TodoStats";
import UndoToast from "./UndoToast";
import BulkActionBar from "./BulkActionBar";

export default function TodoApp() {
  const {
    todos,
    isLoading,
    error,
    pendingDeletions,
    addTodo,
    toggleTodo,
    editTitle,
    editDueDate,
    editPriority,
    deleteTodo,
    undoDelete,
    clearCompleted,
    completeMany,
    deleteMany,
  } = useTodos();
  const [filter, setFilter] = useState<TodoFilterValue>("all");
  const [sort, setSort] = useState<TodoSort>("created");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: press "n" anywhere (outside of a text field) to jump
  // straight to the new-todo input.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "n") return;

      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);
      if (isTyping) return;

      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );
  const completedCount = todos.length - activeCount;

  const visibleTodos = useMemo(() => {
    let list = todos;
    if (filter === "active") list = list.filter((todo) => !todo.completed);
    if (filter === "completed") list = list.filter((todo) => todo.completed);

    const query = searchQuery.trim().toLowerCase();
    if (query) list = list.filter((todo) => todo.title.toLowerCase().includes(query));

    if (sort === "dueDate") {
      list = [...list].sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.createdAt.localeCompare(b.createdAt);
      });
    } else if (sort === "priority") {
      list = [...list].sort((a, b) => {
        const diff = PRIORITY_ORDER.indexOf(b.priority) - PRIORITY_ORDER.indexOf(a.priority);
        return diff !== 0 ? diff : a.createdAt.localeCompare(b.createdAt);
      });
    }

    return list;
  }, [todos, filter, sort, searchQuery]);

  function toggleSelecting() {
    setIsSelecting((prev) => !prev);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allVisibleSelected =
    visibleTodos.length > 0 && visibleTodos.every((todo) => selectedIds.has(todo.id));

  function toggleSelectAll() {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(visibleTodos.map((t) => t.id)));
  }

  function handleBulkComplete(completed: boolean) {
    completeMany([...selectedIds], completed);
    setIsSelecting(false);
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    deleteMany([...selectedIds]);
    setIsSelecting(false);
    setSelectedIds(new Set());
  }

  return (
    <>
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Todoz 📝
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Stay organized and productive
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <TodoInput ref={inputRef} onAdd={addTodo} disabled={isLoading} />

        {todos.length > 0 && (
          <>
            <label htmlFor="search-todos" className="sr-only">
              Search todos
            </label>
            <input
              id="search-todos"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search todos…"
              className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <TodoFilter filter={filter} onChange={setFilter} />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSort((prev) =>
                      prev === "created"
                        ? "dueDate"
                        : prev === "dueDate"
                          ? "priority"
                          : "created"
                    )
                  }
                  className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Sort:{" "}
                  {sort === "created" ? "Newest" : sort === "dueDate" ? "Due date" : "Priority"}
                </button>
                <button
                  type="button"
                  onClick={toggleSelecting}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isSelecting
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  Select
                </button>
              </div>
            </div>
          </>
        )}

        {isSelecting && (
          <BulkActionBar
            count={selectedIds.size}
            allSelected={allVisibleSelected}
            onToggleSelectAll={toggleSelectAll}
            onComplete={() => handleBulkComplete(true)}
            onActivate={() => handleBulkComplete(false)}
            onDelete={handleBulkDelete}
            onCancel={toggleSelecting}
          />
        )}

        <div className="mt-4">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading your todos…
            </p>
          ) : todos.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                No todos yet
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Add your first task above.
              </p>
            </div>
          ) : visibleTodos.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery ? "No todos match your search." : "No todos in this filter."}
              </p>
            </div>
          ) : (
            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEditTitle={editTitle}
              onEditDueDate={editDueDate}
              onEditPriority={editPriority}
              selectionMode={isSelecting}
              selectedIds={selectedIds}
              onSelectToggle={toggleSelected}
            />
          )}
        </div>

        {todos.length > 0 && (
          <footer className="mt-5 flex flex-col items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <TodoStats total={todos.length} active={activeCount} completed={completedCount} />
            {completedCount > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                className="text-sm font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-red-500 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded"
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>

      <UndoToast pendingDeletions={pendingDeletions} onUndo={undoDelete} />
    </>
  );
}

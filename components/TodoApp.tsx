"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TodoFilter as TodoFilterValue, TodoSort } from "@/lib/types";
import { useTodos } from "@/hooks/useTodos";
import TodoInput from "./TodoInput";
import TodoFilter from "./TodoFilter";
import TodoList from "./TodoList";
import TodoStats from "./TodoStats";
import UndoToast from "./UndoToast";

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
    deleteTodo,
    undoDelete,
    clearCompleted,
  } = useTodos();
  const [filter, setFilter] = useState<TodoFilterValue>("all");
  const [sort, setSort] = useState<TodoSort>("created");
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

    if (sort === "dueDate") {
      list = [...list].sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.createdAt.localeCompare(b.createdAt);
      });
    }

    return list;
  }, [todos, filter, sort]);

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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <TodoFilter filter={filter} onChange={setFilter} />
            <button
              type="button"
              onClick={() => setSort((prev) => (prev === "created" ? "dueDate" : "created"))}
              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Sort: {sort === "created" ? "Newest" : "Due date"}
            </button>
          </div>
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
                No todos in this filter.
              </p>
            </div>
          ) : (
            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEditTitle={editTitle}
              onEditDueDate={editDueDate}
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

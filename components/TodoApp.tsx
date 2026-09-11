"use client";

import { useMemo, useState } from "react";
import type { TodoFilter as TodoFilterValue } from "@/lib/types";
import { useTodos } from "@/hooks/useTodos";
import TodoInput from "./TodoInput";
import TodoFilter from "./TodoFilter";
import TodoList from "./TodoList";
import TodoStats from "./TodoStats";

export default function TodoApp() {
  const { todos, isLoading, error, addTodo, toggleTodo, deleteTodo, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState<TodoFilterValue>("all");

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );
  const completedCount = todos.length - activeCount;

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.completed);
    if (filter === "completed") return todos.filter((todo) => todo.completed);
    return todos;
  }, [todos, filter]);

  return (
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

      <TodoInput onAdd={addTodo} disabled={isLoading} />

      {todos.length > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <TodoFilter filter={filter} onChange={setFilter} />
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
          <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
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
  );
}

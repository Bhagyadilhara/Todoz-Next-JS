"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "@/lib/types";
import {
  fetchTodos,
  insertTodo,
  updateTodo,
  deleteTodoById,
  deleteCompletedTodos,
  subscribeToTodos,
  type TodoChange,
} from "@/lib/supabase/todos";

const UNDO_DELETE_DELAY_MS = 5000;

function byCreatedAt(a: Todo, b: Todo) {
  return a.createdAt.localeCompare(b.createdAt);
}

function applyChange(todos: Todo[], change: TodoChange): Todo[] {
  if (change.type === "deleted") {
    return todos.filter((todo) => todo.id !== change.id);
  }

  const exists = todos.some((todo) => todo.id === change.todo.id);
  if (change.type === "inserted" && exists) return todos;

  if (exists) {
    return todos.map((todo) => (todo.id === change.todo.id ? change.todo : todo));
  }
  return [...todos, change.todo].sort(byCreatedAt);
}

interface PendingDeletion {
  todo: Todo;
  timeoutId: ReturnType<typeof setTimeout>;
}

/** Reads and mutates the todo list stored in Supabase, kept live via Realtime. */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const pendingDeletionsRef = useRef<PendingDeletion[]>([]);

  useEffect(() => {
    pendingDeletionsRef.current = pendingDeletions;
  }, [pendingDeletions]);

  useEffect(() => {
    let cancelled = false;

    fetchTodos()
      .then((data) => {
        if (cancelled) return;
        setTodos(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load your todos. Please refresh the page.");
        setIsLoading(false);
      });

    const unsubscribe = subscribeToTodos((change) => {
      setTodos((prev) => applyChange(prev, change));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Clear any pending undo timers on unmount so they don't fire after the
  // component is gone.
  useEffect(() => {
    return () => {
      pendingDeletionsRef.current.forEach((entry) => clearTimeout(entry.timeoutId));
    };
  }, []);

  async function addTodo(title: string, dueDate: string | null = null) {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const newTodo = await insertTodo(trimmed, dueDate);
      setTodos((prev) =>
        prev.some((todo) => todo.id === newTodo.id) ? prev : [...prev, newTodo]
      );
    } catch {
      setError("Couldn't add that todo. Please try again.");
    }
  }

  async function toggleTodo(id: string) {
    const target = todos.find((todo) => todo.id === id);
    if (!target) return;

    try {
      const updated = await updateTodo(id, { completed: !target.completed });
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    } catch {
      setError("Couldn't update that todo. Please try again.");
    }
  }

  async function editTitle(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const updated = await updateTodo(id, { title: trimmed });
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    } catch {
      setError("Couldn't rename that todo. Please try again.");
    }
  }

  async function editDueDate(id: string, dueDate: string | null) {
    try {
      const updated = await updateTodo(id, { dueDate });
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    } catch {
      setError("Couldn't update the due date. Please try again.");
    }
  }

  /** Hides the todo immediately and schedules the real delete, so it can be undone. */
  function deleteTodo(id: string) {
    const target = todos.find((todo) => todo.id === id);
    if (!target) return;

    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    const timeoutId = setTimeout(async () => {
      setPendingDeletions((prev) => prev.filter((entry) => entry.todo.id !== id));
      try {
        await deleteTodoById(id);
      } catch {
        setError("Couldn't delete that todo. Please try again.");
        setTodos((prev) =>
          prev.some((todo) => todo.id === id) ? prev : [...prev, target].sort(byCreatedAt)
        );
      }
    }, UNDO_DELETE_DELAY_MS);

    setPendingDeletions((prev) => [...prev, { todo: target, timeoutId }]);
  }

  function undoDelete(id: string) {
    const entry = pendingDeletions.find((item) => item.todo.id === id);
    if (!entry) return;

    clearTimeout(entry.timeoutId);
    setPendingDeletions((prev) => prev.filter((item) => item.todo.id !== id));
    setTodos((prev) =>
      prev.some((todo) => todo.id === id) ? prev : [...prev, entry.todo].sort(byCreatedAt)
    );
  }

  async function clearCompleted() {
    try {
      await deleteCompletedTodos();
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    } catch {
      setError("Couldn't clear completed todos. Please try again.");
    }
  }

  return {
    todos,
    isLoading,
    error,
    pendingDeletions: pendingDeletions.map((entry) => entry.todo),
    addTodo,
    toggleTodo,
    editTitle,
    editDueDate,
    deleteTodo,
    undoDelete,
    clearCompleted,
  };
}

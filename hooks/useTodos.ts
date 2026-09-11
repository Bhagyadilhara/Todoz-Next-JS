"use client";

import { useEffect, useState } from "react";
import type { Todo } from "@/lib/types";
import {
  fetchTodos,
  insertTodo,
  updateTodoCompleted,
  deleteTodoById,
  deleteCompletedTodos,
} from "@/lib/supabase/todos";

/** Reads and mutates the todo list stored in Supabase. */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTodo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const newTodo = await insertTodo(trimmed);
      setTodos((prev) => [...prev, newTodo]);
    } catch {
      setError("Couldn't add that todo. Please try again.");
    }
  }

  async function toggleTodo(id: string) {
    const target = todos.find((todo) => todo.id === id);
    if (!target) return;

    try {
      const updated = await updateTodoCompleted(id, !target.completed);
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    } catch {
      setError("Couldn't update that todo. Please try again.");
    }
  }

  async function deleteTodo(id: string) {
    try {
      await deleteTodoById(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch {
      setError("Couldn't delete that todo. Please try again.");
    }
  }

  async function clearCompleted() {
    try {
      await deleteCompletedTodos();
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    } catch {
      setError("Couldn't clear completed todos. Please try again.");
    }
  }

  return { todos, isLoading, error, addTodo, toggleTodo, deleteTodo, clearCompleted };
}

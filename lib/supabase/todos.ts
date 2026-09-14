import { supabase } from "./client";
import type { Todo } from "../types";

interface TodoRow {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  due_date: string | null;
}

const TODO_COLUMNS = "id, title, completed, created_at, due_date";

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
    dueDate: row.due_date,
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select(TODO_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}

export async function insertTodo(
  title: string,
  dueDate: string | null
): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert({ title, due_date: dueDate })
    .select(TODO_COLUMNS)
    .single();

  if (error) throw error;
  return mapRow(data);
}

interface TodoUpdates {
  title?: string;
  completed?: boolean;
  dueDate?: string | null;
}

export async function updateTodo(id: string, updates: TodoUpdates): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
      ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
    })
    .eq("id", id)
    .select(TODO_COLUMNS)
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteTodoById(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCompletedTodos(): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("completed", true);
  if (error) throw error;
}

export type TodoChange =
  | { type: "inserted" | "updated"; todo: Todo }
  | { type: "deleted"; id: string };

/** Subscribes to live changes on the todos table. Returns an unsubscribe function. */
export function subscribeToTodos(onChange: (change: TodoChange) => void): () => void {
  const channel = supabase
    .channel("todos-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "todos" },
      (payload) => onChange({ type: "inserted", todo: mapRow(payload.new as TodoRow) })
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "todos" },
      (payload) => onChange({ type: "updated", todo: mapRow(payload.new as TodoRow) })
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "todos" },
      (payload) => onChange({ type: "deleted", id: (payload.old as { id: string }).id })
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

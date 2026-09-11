import { supabase } from "./client";
import type { Todo } from "../types";

interface TodoRow {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("id, title, completed, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}

export async function insertTodo(title: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert({ title })
    .select("id, title, completed, created_at")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateTodoCompleted(
  id: string,
  completed: boolean
): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .select("id, title, completed, created_at")
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

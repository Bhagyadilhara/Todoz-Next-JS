import type { Todo } from "@/lib/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEditTitle: (id: string, title: string) => void;
  onEditDueDate: (id: string, dueDate: string | null) => void;
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onEditTitle,
  onEditDueDate,
}: TodoListProps) {
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEditTitle={onEditTitle}
          onEditDueDate={onEditDueDate}
        />
      ))}
    </ul>
  );
}

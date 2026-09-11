"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface TodoInputProps {
  onAdd: (title: string) => void;
  disabled?: boolean;
}

export default function TodoInput({ onAdd, disabled = false }: TodoInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;

    onAdd(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="new-todo" className="sr-only">
        New todo
      </label>
      <input
        id="new-todo"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="What needs to be done?"
        autoComplete="off"
        disabled={disabled}
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-zinc-900"
      >
        Add
      </button>
    </form>
  );
}

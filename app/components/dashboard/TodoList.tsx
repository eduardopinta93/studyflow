'use client';

import { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
}

const dotColors = {
  low: 'bg-blue-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text: input.trim(), done: false, priority: 'medium' },
      ...prev,
    ]);
    setInput('');
  };

  const toggle = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const remove = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="glass rounded-[1.75rem] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
          To-Do
        </h2>
        {todos.length > 0 && (
          <span className="text-xs text-[var(--muted-foreground)]">{doneCount}/{todos.length} done</span>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); add(); }}
        className="flex gap-2 mb-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you need to do?"
          className="glass-field flex-1 px-3.5 py-2 rounded-xl text-sm placeholder:text-[var(--muted-foreground)]/50"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="glass-btn glass-btn-primary px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {todos.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]/60 text-center py-8">
            Add a task above to get started
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors"
          >
            <button
              onClick={() => toggle(todo.id)}
              className={`w-[19px] h-[19px] rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                todo.done
                  ? 'bg-[var(--accent)] border-[var(--accent)]'
                  : 'bg-black/25 border border-white/15 hover:border-[var(--accent)] hover:bg-black/40'
              }`}
            >
              {todo.done && <Check size={11} className="text-white" strokeWidth={3} />}
            </button>
            <span className={`flex-1 text-sm ${todo.done ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
              {todo.text}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[todo.priority]}`} />
            <button
              onClick={() => remove(todo.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive-text)] transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

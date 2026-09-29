// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, Plus, Trash2, ListTodo } from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Task = {
  id: string;
  text: string;
  done: boolean;
};

export default function TodoWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Subscribe to tasks collection
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(newTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, "tasks"), {
        text,
        done: false,
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggle = async (id: string, currentDone: boolean) => {
    try {
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, {
        done: !currentDone,
      });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!mounted) {
    return (
      <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
        {/* Loading skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/15" />
          <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-10 bg-white/10 rounded-xl animate-pulse mb-4" />
        <div className="flex-1 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
      <header className="flex items-center gap-2 mb-4 shrink-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 shadow-[0_0_26px_rgba(16,185,129,0.4)]">
          <ListTodo className="w-4 h-4" aria-hidden />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base md:text-lg font-medium text-slate-50">To-Do</h2>
          <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
            Cloud Sync • Firebase
          </p>
        </div>
      </header>

      <form onSubmit={add} className="shrink-0 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="New task..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none"
            aria-label="New task"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Add task"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <ul className="flex-1 min-h-0 overflow-auto space-y-1.5">
        {loading && tasks.length === 0 && (
          <div className="flex-1 space-y-2 mt-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        )}
        {!loading && tasks.length === 0 && (
          <li className="text-sm text-slate-500 py-2">No tasks yet.</li>
        )}
        {tasks.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
          >
            <button
              type="button"
              onClick={() => toggle(t.id, t.done)}
              className="shrink-0 text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-slate-800 rounded"
              aria-label={t.done ? "Mark incomplete" : "Mark complete"}
            >
              {t.done ? (
                <CheckSquare className="w-5 h-5 text-emerald-400" aria-hidden />
              ) : (
                <Square className="w-5 h-5" aria-hidden />
              )}
            </button>
            <span
              className={`flex-1 min-w-0 text-sm text-slate-200 ${t.done ? "line-through text-slate-500" : ""
                }`}
            >
              {t.text}
            </span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 focus:ring-offset-slate-800"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

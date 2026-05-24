'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Sparkles,
  Check,
  Trash2,
  ListTodo,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';
import HeaderAndNav from '../../components/HeaderAndNav';
import { playSound } from '../../lib/sound';
import {
  INITIAL_TASKS,
  loadState,
  saveState
} from '../../lib/state';

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tasks States
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('★ MEDIUM');
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DONE'
  const [searchQuery, setSearchQuery] = useState('');

  // Hydration state load & settings preloader on mount
  useEffect(() => {
    setTimeout(() => {
      setTasks(loadState('neo_tasks', INITIAL_TASKS));
      const savedSound = localStorage.getItem('neo_sound');
      if (savedSound !== null) {
        try {
          setSoundEnabled(JSON.parse(savedSound));
        } catch (e) {
          setSoundEnabled(true);
        }
      }
      setMounted(true);
    }, 0);
  }, []);

  // Save to LS when state changes
  useEffect(() => {
    if (mounted) {
      saveState('neo_tasks', tasks);
    }
  }, [tasks, mounted]);

  // Count metrics
  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - doneCount;
  const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Actions
  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!taskText.trim()) return;

    playSound('success', soundEnabled);
    const newTask = {
      id: 'task_' + Date.now(),
      text: taskText.trim(),
      completed: false,
      difficulty: taskDifficulty,
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskText('');
  };

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextVal = !t.completed;
          playSound(nextVal ? 'success' : 'click', soundEnabled);
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id) => {
    playSound('delete', soundEnabled);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    playSound('delete', soundEnabled);
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleMarkAllDone = () => {
    playSound('success', soundEnabled);
    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
  };

  // Searching + Filtering
  const filteredTasks = tasks.filter((t) => {
    // Search filter
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    if (!matchesSearch) return false;
    if (taskFilter === 'ACTIVE') return !t.completed;
    if (taskFilter === 'DONE') return t.completed;
    return true;
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-300 flex items-center justify-center font-mono">
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-4 border-black border-t-transparent"></div>
          <span className="font-extrabold uppercase">Loading Retro Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto selection:bg-yellow-400 selection:text-black flex flex-col gap-6">
      <HeaderAndNav />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SPECIALIZED TASK CREATOR (Spawn Pad) */}
        <section className="lg:col-span-4 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="bg-red-500 text-white p-4 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400 shrink-0" />
              <h2 className="text-sm font-black uppercase italic tracking-tight">Spawn New Quest</h2>
            </div>
            <span className="bg-white text-black text-[9px] font-bold px-2 py-0.5 border border-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              Level 1
            </span>
          </div>

          <form onSubmit={handleAddTask} className="p-4 space-y-4 bg-zinc-100">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                🔍 Quest Objective / Deskripsi Tugas
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tulis misi / quest yang wajib diselesaikan hari ini..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                ⚖️ Difficulty Category & HP Cost
              </label>
              <select
                value={taskDifficulty}
                onChange={(e) => setTaskDifficulty(e.target.value)}
                className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
              >
                <option value="★ LIGHT">★ LIGHT (Easy Misi / low effort)</option>
                <option value="★ MEDIUM">★ MEDIUM (Intermediet / 1-2 jam fokus)</option>
                <option value="★ HARD">★ HARD (Epic Tier / butuh level konsentrasi tinggi)</option>
              </select>
            </div>

            <button
              id="submit-task-btn"
              type="submit"
              className="w-full border-3 border-black bg-red-500 text-white font-black uppercase py-3 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition duration-155 cursor-pointer"
            >
              ➕ CAST NEW QUEST
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: FULL QUEST BOARD LIST */}
        <section className="lg:col-span-8 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="bg-zinc-950 text-white p-4 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-red-500 shrink-0" strokeWidth={3} />
              <h2 className="text-base font-black uppercase italic tracking-tight">Main Quest Board Log ({totalCount})</h2>
            </div>

            {/* Progress Gauge */}
            <div className="flex items-center gap-3 font-mono text-[10px] bg-zinc-900 border border-zinc-700 p-1.5 px-3 min-w-[150px]">
              <div className="flex-1">
                <div className="flex justify-between font-bold text-yellow-500 mb-0.5">
                  <span>CLEAR RATE:</span>
                  <span>{donePercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 border border-zinc-600 h-2">
                  <div className="bg-yellow-400 h-full transition-all duration-300" style={{ width: `${donePercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Search Ribbon */}
          <div className="p-3 border-b-3 border-black bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari misi / kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-2 border-black p-1.5 px-3 text-xs font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none w-full sm:w-64"
            />

            {/* Brutalist Filters */}
            <div className="flex gap-1.5 font-mono text-[9px] font-black self-start sm:self-auto">
              {[
                { type: 'ALL', label: `ALL (${totalCount})` },
                { type: 'ACTIVE', label: `ACTIVE (${activeCount})` },
                { type: 'DONE', label: `DONE (${doneCount})` },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setTaskFilter(item.type);
                  }}
                  className={`py-1 px-2.5 border-2 border-black uppercase cursor-pointer transition-all duration-75 text-[10px] ${
                    taskFilter === item.type
                      ? 'bg-red-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-650 hover:bg-zinc-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-100 min-h-[350px] space-y-3 flex flex-col justify-between">
            {/* List */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 border-4 border-dashed border-zinc-400 bg-white">
                  <p className="text-xs font-mono text-zinc-500 uppercase font-black">QUEST LOG KOSONG ATAU TIDAK DITEMUKAN 🛸</p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`border-2 border-black p-3.5 flex justify-between items-center transition duration-100 ${
                      t.completed
                        ? 'bg-zinc-100 opacity-60 line-through decoration-zinc-550'
                        : 'bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <button
                        onClick={() => handleToggleTask(t.id)}
                        className={`w-6 h-6 border-2 border-black shrink-0 flex items-center justify-center cursor-pointer ${
                          t.completed ? 'bg-red-500 text-white' : 'bg-white'
                        }`}
                      >
                        {t.completed && <Check size={14} strokeWidth={4} />}
                      </button>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight break-words max-w-xs sm:max-w-md">
                          {t.text}
                        </span>
                        <span
                          className={`text-[8px] font-black border border-black px-1 py-0.2 self-start uppercase max-w-max font-mono ${
                            t.difficulty === '★ HARD'
                              ? 'bg-red-500 text-white'
                              : t.difficulty === '★ LIGHT'
                              ? 'bg-yellow-400 text-black'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {t.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1 px-1.5 border border-black bg-white hover:bg-red-500 hover:text-white cursor-pointer transition"
                      title="Hapus Quest"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick action bar */}
            {tasks.length > 0 && (
              <div className="pt-4 border-t-2 border-black flex flex-wrap justify-between items-center gap-2 font-mono text-[9px]">
                <span className="text-zinc-600 uppercase font-black">
                  Lvl. 1 Quest Master Stash: {doneCount}/{totalCount} completed
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllDone}
                    className="bg-zinc-900 text-white hover:bg-zinc-805 p-1.5 px-3 border border-black cursor-pointer uppercase font-black transition"
                  >
                    🚀 Selesaikan Semua
                  </button>
                  <button
                    onClick={handleClearCompleted}
                    className="bg-red-550 text-white hover:bg-red-600 p-1.5 px-3 border border-black cursor-pointer uppercase font-black transition"
                  >
                    🧹 Bersihkan Yang Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

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
  });  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans text-slate-100">
        <div className="border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">Loading Digital Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto selection:bg-indigo-500/40 selection:text-white flex flex-col gap-6 relative z-10">
      <HeaderAndNav />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SPECIALIZED TASK CREATOR (Spawn Pad) */}
        <section className="lg:col-span-4 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Spawn New Quest</h2>
            </div>
            <span className="bg-indigo-500/15 text-indigo-400 text-[9px] font-bold px-2.5 py-0.5 border border-indigo-500/20 rounded-full uppercase tracking-wider">
              Level 1
            </span>
          </div>

          <form onSubmit={handleAddTask} className="p-5 space-y-4 bg-transparent">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                🔍 Quest Objective / Deskripsi Tugas
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tulis misi / quest yang wajib diselesaikan hari ini..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                ⚖️ Difficulty Category & HP Cost
              </label>
              <select
                value={taskDifficulty}
                onChange={(e) => setTaskDifficulty(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 text-white p-2.5 text-xs font-bold rounded-xl focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              >
                <option value="★ LIGHT">★ LIGHT (Easy Misi / low effort)</option>
                <option value="★ MEDIUM">★ MEDIUM (Intermediet / 1-2 jam fokus)</option>
                <option value="★ HARD">★ HARD (Epic Tier / butuh level konsentrasi tinggi)</option>
              </select>
            </div>

            <button
              id="submit-task-btn"
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer mt-1"
            >
              ➕ CAST NEW QUEST
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: FULL QUEST BOARD LIST */}
        <section className="lg:col-span-8 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-indigo-400 shrink-0" strokeWidth={2.5} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Main Quest Board Log ({totalCount})</h2>
            </div>

            {/* Progress Gauge */}
            <div className="flex items-center gap-3 font-sans text-[10px] bg-white/[0.02] border border-white/5 p-2 px-3.5 rounded-xl min-w-[170px] shadow-sm">
              <div className="flex-1">
                <div className="flex justify-between font-bold text-indigo-400 mb-1 whitespace-nowrap">
                  <span className="tracking-wide text-[9px]">CLEAR RATE:</span>
                  <span>{donePercent}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 overflow-hidden rounded-full">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${donePercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Search Ribbon */}
          <div className="p-4 border-b border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari misi / kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 w-full sm:w-64 shadow-sm"
            />

            {/* Brutalist Filters */}
            <div className="flex gap-1.5 font-sans text-[9px] font-bold self-start sm:self-auto">
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
                  className={`py-1.5 px-3 rounded-lg border uppercase cursor-pointer transition-all duration-200 text-[10px] font-bold ${
                    taskFilter === item.type
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-transparent min-h-[350px] space-y-4 flex flex-col justify-between">
            {/* List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                  <p className="text-xs font-semibold text-slate-450 uppercase tracking-widest">QUEST LOG KOSONG ATAU TIDAK DITEMUKAN 🛸</p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`border p-4 flex justify-between items-center transition-all duration-350 rounded-2xl ${
                      t.completed
                        ? 'border-white/5 bg-white/[0.01] opacity-50 line-through'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <button
                        onClick={() => handleToggleTask(t.id)}
                        className={`w-5.5 h-5.5 rounded-lg border shrink-0 flex items-center justify-center cursor-pointer transition ${
                          t.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.02] border-white/20 hover:border-indigo-400'
                        }`}
                      >
                        {t.completed && <Check size={12} strokeWidth={3} className="text-white" />}
                      </button>
 
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs sm:text-sm font-semibold leading-relaxed transition ${t.completed ? 'text-slate-500' : 'text-slate-100'}`}>
                          {t.text}
                        </span>
                        <span
                          className={`text-[8px] font-bold border rounded-full px-2.5 py-0.5 tracking-wider uppercase max-w-max font-sans ${
                            t.difficulty === '★ HARD'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                              : t.difficulty === '★ LIGHT'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {t.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1.5 border border-white/10 hover:border-rose-500/30 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer shrink-0"
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
              <div className="pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-2 text-[10px] text-slate-450 font-sans font-medium uppercase tracking-wider">
                <span className="font-bold">
                  Stash Counter Master: {doneCount}/{totalCount} Completed
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllDone}
                    className="bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-bold p-2 px-3.5 rounded-xl transition duration-200 cursor-pointer uppercase tracking-wider"
                  >
                    🚀 Selesaikan Semua
                  </button>
                  <button
                    onClick={handleClearCompleted}
                    className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border border-rose-500/20 p-2 px-3.5 rounded-xl transition duration-200 cursor-pointer uppercase tracking-wider"
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

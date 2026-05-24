'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Plus,
  Trash2,
  Check,
  Flame,
  TrendingDown,
  TrendingUp,
  CreditCard,
  CheckSquare,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import HeaderAndNav from '../components/HeaderAndNav';
import { playSound } from '../lib/sound';
import {
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_HABITS,
  loadState,
  saveState
} from '../lib/state';

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core States
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [habits, setHabits] = useState([]);

  // Console active tab: 'task' | 'money' | 'habit'
  const [activeTab, setActiveTab] = useState('task');

  // Input states
  const [taskText, setTaskText] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('★ MEDIUM');

  const [transText, setTransText] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transType, setTransType] = useState('expense'); // expense | income
  const [transCategory, setTransCategory] = useState('Jajan');

  const [habitText, setHabitText] = useState('');

  // Hydration safety and loading initial state strictly on Client side
  useEffect(() => {
    setTimeout(() => {
      setTasks(loadState('neo_tasks', INITIAL_TASKS));
      setTransactions(loadState('neo_transactions', INITIAL_TRANSACTIONS));
      setHabits(loadState('neo_habits', INITIAL_HABITS));
      
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

  // Sync states to LocalStorage
  useEffect(() => {
    if (mounted) saveState('neo_tasks', tasks);
  }, [tasks, mounted]);

  useEffect(() => {
    if (mounted) saveState('neo_transactions', transactions);
  }, [transactions, mounted]);

  useEffect(() => {
    if (mounted) saveState('neo_habits', habits);
  }, [habits, mounted]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const currentBalance = totalIncome - totalExpense;

  // Actions
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

  const handleAddTransaction = (e) => {
    if (e) e.preventDefault();
    if (!transText.trim() || !transAmount) return;

    playSound('cash', soundEnabled);
    const amt = parseFloat(transAmount);
    const isEx = transType === 'expense';
    const finalAmount = isEx ? -Math.abs(amt) : Math.abs(amt);

    const newTrans = {
      id: 'trans_' + Date.now(),
      text: transText.trim(),
      amount: finalAmount,
      type: transType,
      category: transCategory,
    };
    setTransactions((prev) => [newTrans, ...prev]);
    setTransText('');
    setTransAmount('');
  };

  const handleAddHabit = (e) => {
    if (e) e.preventDefault();
    if (!habitText.trim()) return;

    playSound('success', soundEnabled);
    const newHabit = {
      id: 'habit_' + Date.now(),
      text: habitText.trim(),
      streak: 0,
      days: { Sen: false, Sel: false, Rab: false, Kam: false, Jum: false, Sab: false, Min: false },
    };
    setHabits((prev) => [newHabit, ...prev]);
    setHabitText('');
  };

  const handleDeleteTransaction = (id) => {
    playSound('delete', soundEnabled);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };  if (!mounted) {
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
    <div
      id="main-container"
      className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto selection:bg-indigo-500/40 selection:text-white flex flex-col gap-6 relative z-10"
    >
      {/* 1. SHARED HEADER & NAV */}
      <HeaderAndNav />

      {/* 2. MAIN BENTO GRID */}
      <div id="dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================
            LEFT COLUMN (Lg:4 span): QUICK ADD & STATUS SUMMARY
            ========================================================= */}
        <div id="left-column" className="lg:col-span-4 flex flex-col gap-6">
          {/* A. QUICK ADD CONSOLE */}
          <section
            id="quick-add-console"
            className="border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
          >
            <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Console Tambah Cepat</h2>
              </div>
              <span className="bg-indigo-500/15 text-indigo-400 text-[9px] font-bold px-2 py-0.5 border border-indigo-500/20 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="p-5">
              {/* TAB SELECTORS */}
              <div className="grid grid-cols-3 bg-white/[0.03] border border-white/5 p-1 mb-4 gap-1 rounded-xl">
                <button
                  id="tab-task"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setActiveTab('task');
                  }}
                  className={`py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-lg cursor-pointer transition duration-300 ${
                    activeTab === 'task'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🗂️ QUEST
                </button>
                <button
                  id="tab-money"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setActiveTab('money');
                  }}
                  className={`py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-lg cursor-pointer transition duration-300 ${
                    activeTab === 'money'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  💰 UANG
                </button>
                <button
                  id="tab-habit"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setActiveTab('habit');
                  }}
                  className={`py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-lg cursor-pointer transition duration-300 ${
                    activeTab === 'habit'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🔄 HABIT
                </button>
              </div>

              {/* TAB CONTENT 1: QUEST / TASK */}
              {activeTab === 'task' && (
                <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Nama Tugas / Quest Harian
                    </label>
                    <input
                      id="input-task-text"
                      type="text"
                      required
                      placeholder="Contoh: Belajar NextJS 15 jam..."
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Tingkat Kesulitan / HP Cost
                    </label>
                    <select
                      id="input-task-difficulty"
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 text-white p-2.5 text-xs font-bold rounded-xl focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                    >
                      <option value="★ LIGHT">★ LIGHT (Mudah / Instan)</option>
                      <option value="★ MEDIUM">★ MEDIUM (Progres Sedang)</option>
                      <option value="★ HARD">★ HARD (Butuh Fokus Tinggi)</option>
                    </select>
                  </div>

                  <button
                    id="submit-task-btn"
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-2.5 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer mt-2"
                  >
                    ➕ TAMBAH TUGAS (QUEST)
                  </button>
                </form>
              )}

              {/* TAB CONTENT 2: MONEY / CASHFLOW */}
              {activeTab === 'money' && (
                <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="trans-type-expense-btn"
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setTransType('expense');
                      }}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-xl transition duration-300 ${
                        transType === 'expense'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      💸 EXPENSE (-)
                    </button>
                    <button
                      id="trans-type-income-btn"
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setTransType('income');
                      }}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-xl transition duration-300 ${
                        transType === 'income'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      💰 INCOME (+)
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Keterangan Transaksi
                    </label>
                    <input
                      id="input-trans-text"
                      type="text"
                      required
                      placeholder="Contoh: Beli Makan Siang Padang..."
                      value={transText}
                      onChange={(e) => setTransText(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Jumlah (Rupiah)
                      </label>
                      <input
                        id="input-trans-amount"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 15000"
                        value={transAmount}
                        onChange={(e) => setTransAmount(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Kategori
                      </label>
                      <select
                        id="input-trans-category"
                        value={transCategory}
                        onChange={(e) => setTransCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 text-white p-2.5 text-xs font-bold rounded-xl focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                      >
                        <option value="Jajan">🍔 Jajan</option>
                        <option value="Project">💼 Project</option>
                        <option value="Saku">💵 Saku</option>
                        <option value="Belanja">🛍️ Belanja</option>
                        <option value="Pribadi">🛡️ Pribadi</option>
                      </select>
                    </div>
                  </div>

                  <button
                    id="submit-trans-btn"
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-2.5 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer mt-2"
                  >
                    🧾 CATAT TRANSAKSI
                  </button>
                </form>
              )}

              {/* TAB CONTENT 3: HABIT */}
              {activeTab === 'habit' && (
                <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Nama Kebiasaan Positif
                    </label>
                    <input
                      id="input-habit-text"
                      type="text"
                      required
                      placeholder="Contoh: Olahraga Ringan pagi..."
                      value={habitText}
                      onChange={(e) => setHabitText(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <p className="text-[10px] leading-relaxed text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                    💡 Kebiasaan baru ditambahkan dengan status mingguan kosong. Anda dapat mengelolanya secara lengkap di tab Habit Tracker.
                  </p>

                  <button
                    id="submit-habit-btn"
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-2.5 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer mt-2"
                  >
                    ⚡ DAFTARKAN HABIT BARU
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* B. CORE SYSTEM METRIC COUNTER */}
          <section
            id="system-stats-widget"
            className="border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
          >
            <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">System Global Analysis</h2>
            </div>

            <div className="p-5 space-y-4 font-sans text-xs bg-transparent">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 shadow-md flex flex-col gap-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-300 tracking-wide">🎯 QUESTS PROGRESS CARD:</span>
                  <span className="bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-lg tracking-wider">
                    {tasks.filter((t) => t.completed).length}/{tasks.length} DONE
                  </span>
                </div>
                <div className="w-full bg-white/5 border border-white/5 h-3 overflow-hidden rounded-full self-stretch mt-1">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    style={{
                      width: `${tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 shadow-md flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-300 tracking-wide">🔥 HIGHEST ACTIVE STREAK:</span>
                  <span className="bg-orange-500/15 border border-orange-500/30 text-orange-300 px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-lg tracking-wider">
                    {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0} DAY
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="text-orange-400 fill-orange-400/20 shrink-0" size={16} />
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Pertahankan kedisiplinan harian secara beruntun!
                  </span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 shadow-md flex justify-between items-center">
                <span className="text-slate-300 font-bold tracking-wide">💳 TOTAL FINANCES CASH:</span>
                <span
                  className={`px-3 py-1 text-[11px] font-bold rounded-xl border ${
                    currentBalance >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  Rp {currentBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            RIGHT COLUMN (Lg:8 span): CONDENSED PREVIEWS LINKED TO SUBPAGES
            ========================================================= */}
        <div id="right-column" className="lg:col-span-8 flex flex-col gap-6">
          {/* A. CONDENSED QUESTS PREVIEW */}
          <section className="border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="bg-gradient-to-r from-red-500/10 to-transparent text-white p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="shrink-0 text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Active Quests (Preview)</h2>
              </div>
              <Link
                href="/tasks"
                className="bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-bold text-[10px] uppercase px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Full Page</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="p-5 space-y-2.5">
              {tasks.filter((t) => !t.completed).slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Tidak ada Quest Aktif yang tersisa 🎉</p>
                </div>
              ) : (
                tasks
                  .filter((t) => !t.completed)
                  .slice(0, 3)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="border border-white/5 p-3.5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl flex justify-between items-center transition duration-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleTask(t.id)}
                          className="w-5 h-5 rounded-lg border border-white/20 hover:border-indigo-400 hover:bg-white/5 flex items-center justify-center cursor-pointer shrink-0 transition"
                        >
                          {t.completed && <Check size={12} strokeWidth={3} className="text-indigo-400" />}
                        </button>
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">{t.text}</span>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {t.difficulty}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* B. CONDENSED FINANCIAL PREVIEW */}
          <section className="border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="bg-gradient-to-r from-blue-500/10 to-transparent text-white p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="shrink-0 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Cashflow Ledger (Preview)</h2>
              </div>
              <Link
                href="/transactions"
                className="bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-bold text-[10px] uppercase px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Full Ledger</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="p-5 space-y-2.5">
              {transactions.slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Belum ada riwayat transaksi</p>
                </div>
              ) : (
                transactions.slice(0, 3).map((tr) => (
                  <div
                    key={tr.id}
                    className="border border-white/5 p-3.5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl flex justify-between items-center transition duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black shrink-0 ${
                          tr.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/15 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        {tr.type === 'income' ? 'IN' : 'OT'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight text-slate-100">{tr.text}</span>
                        <span className="text-[8px] bg-white/5 border border-white/5 rounded px-1.5 self-start font-bold mt-0.5 text-slate-400 uppercase tracking-wide">
                          {tr.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold ${
                          tr.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tr.type === 'income' ? '+' : '-'} Rp{Math.abs(tr.amount).toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(tr.id)}
                        className="p-1.5 border border-white/10 hover:border-rose-500/30 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* C. CONDENSED HABITS PREVIEW */}
          <section className="border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent text-white p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="shrink-0 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Active Habits (Preview)</h2>
              </div>
              <Link
                href="/habits"
                className="bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-bold text-[10px] uppercase px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Full Habit Tracker</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="p-5 space-y-2.5">
              {habits.slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Belum ada target kebiasaan</p>
                </div>
              ) : (
                habits.slice(0, 3).map((h) => (
                  <div
                    key={h.id}
                    className="border border-white/5 p-3.5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl flex justify-between items-center transition duration-300"
                  >
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-sm">{h.text}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">STREAK:</span>
                      <span className="bg-orange-500/10 hover:bg-orange-500/15 text-orange-300 font-bold text-[10px] px-2.5 py-1 border border-orange-500/25 rounded-lg tracking-wider uppercase flex items-center gap-1">
                        <Flame size={11} className="fill-orange-400/20" /> {h.streak} DAYS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

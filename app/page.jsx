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
  };

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
    <div
      id="main-container"
      className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto selection:bg-yellow-400 selection:text-black flex flex-col gap-6"
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
            className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col"
          >
            <div className="bg-zinc-950 text-white p-3 border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                <h2 className="text-sm font-black uppercase italic tracking-tight">Console Tambah Cepat</h2>
              </div>
              <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 border border-black uppercase">
                Active
              </span>
            </div>

            <div className="p-4 bg-zinc-100">
              {/* TAB SELECTORS */}
              <div className="grid grid-cols-3 border-3 border-black bg-zinc-950 p-1 mb-4 gap-1">
                <button
                  id="tab-task"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setActiveTab('task');
                  }}
                  className={`py-2 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                    activeTab === 'task'
                      ? 'bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
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
                  className={`py-2 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                    activeTab === 'money'
                      ? 'bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
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
                  className={`py-2 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                    activeTab === 'habit'
                      ? 'bg-emerald-500 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  🔄 HABIT
                </button>
              </div>

              {/* TAB CONTENT 1: QUEST / TASK */}
              {activeTab === 'task' && (
                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                      Nama Tugas / Quest Harian
                    </label>
                    <input
                      id="input-task-text"
                      type="text"
                      required
                      placeholder="Contoh: Belajar NextJS 15 jam..."
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                      Tingkat Kesulitan / HP Cost
                    </label>
                    <select
                      id="input-task-difficulty"
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value)}
                      className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                    >
                      <option value="★ LIGHT">★ LIGHT (Mudah / Instan)</option>
                      <option value="★ MEDIUM">★ MEDIUM (Progres Sedang)</option>
                      <option value="★ HARD">★ HARD (Butuh Fokus Tinggi)</option>
                    </select>
                  </div>

                  <button
                    id="submit-task-btn"
                    type="submit"
                    className="w-full border-3 border-black bg-red-500 text-white font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition cursor-pointer mt-2"
                  >
                    ➕ TAMBAH TUGAS (QUEST)
                  </button>
                </form>
              )}

              {/* TAB CONTENT 2: MONEY / CASHFLOW */}
              {activeTab === 'money' && (
                <form onSubmit={handleAddTransaction} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="trans-type-expense-btn"
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setTransType('expense');
                      }}
                      className={`py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black transition ${
                        transType === 'expense'
                          ? 'bg-red-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-zinc-500 hover:text-black'
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
                      className={`py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black transition ${
                        transType === 'income'
                          ? 'bg-green-500 text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-zinc-500 hover:text-black'
                      }`}
                    >
                      💰 INCOME (+)
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                      Keterangan Transaksi
                    </label>
                    <input
                      id="input-trans-text"
                      type="text"
                      required
                      placeholder="Contoh: Beli Makan Siang Padang..."
                      value={transText}
                      onChange={(e) => setTransText(e.target.value)}
                      className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
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
                        className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                        Kategori
                      </label>
                      <select
                        id="input-trans-category"
                        value={transCategory}
                        onChange={(e) => setTransCategory(e.target.value)}
                        className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
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
                    className="w-full border-3 border-black bg-blue-600 text-white font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-blue-650 transition cursor-pointer mt-2"
                  >
                    🧾 CATAT TRANSAKSI
                  </button>
                </form>
              )}

              {/* TAB CONTENT 3: HABIT */}
              {activeTab === 'habit' && (
                <form onSubmit={handleAddHabit} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                      Nama Kebiasaan Positif
                    </label>
                    <input
                      id="input-habit-text"
                      type="text"
                      required
                      placeholder="Contoh: Olahraga Ringan pagi..."
                      value={habitText}
                      onChange={(e) => setHabitText(e.target.value)}
                      className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                    />
                  </div>

                  <p className="text-[9px] font-mono leading-tight text-neutral-800 bg-amber-200 border border-dashed border-black p-2 rounded-none">
                    💡 Kebiasaan baru ditambahkan dengan status mingguan kosong. Anda dapat mengelolanya secara lengkap di tab Habit Tracker.
                  </p>

                  <button
                    id="submit-habit-btn"
                    type="submit"
                    className="w-full border-3 border-black bg-emerald-500 text-black font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-emerald-450 transition cursor-pointer mt-2"
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
            className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col"
          >
            <div className="bg-zinc-800 text-white p-3 border-b-4 border-black flex items-center gap-2">
              <Info size={16} className="text-yellow-400" />
              <h2 className="text-sm font-black uppercase italic tracking-tight">System Global Analysis</h2>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs bg-zinc-50">
              <div className="border-2 border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span>🎯 QUESTS PROGRESS CARD:</span>
                  <span className="bg-red-500 text-white px-2 py-0.5 text-[10px] uppercase border border-black font-bold">
                    {tasks.filter((t) => t.completed).length}/{tasks.length} DONE
                  </span>
                </div>
                <div className="w-full bg-zinc-200 border-2 border-black h-4 overflow-hidden">
                  <div
                    className="bg-red-500 h-full border-r border-black transition-all duration-300"
                    style={{
                      width: `${tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="border-2 border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span>🔥 HIGHEST ACTIVE STREAK:</span>
                  <span className="bg-emerald-400 text-black px-2 py-0.5 text-[10px] uppercase border border-black font-bold">
                    {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0} DAY
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Flame className="text-orange-500 fill-orange-500 shrink-0 animate-bounce" size={16} />
                  <span className="text-[9px] text-zinc-500 leading-none uppercase">
                    Pertahankan kedisiplinan harian secara beruntun!
                  </span>
                </div>
              </div>

              <div className="border-2 border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span>💳 TOTAL FINANCES CASH:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] border border-black font-bold ${
                      currentBalance >= 0 ? 'bg-green-400 text-black' : 'bg-red-500 text-white'
                    }`}
                  >
                    Rp {currentBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            RIGHT COLUMN (Lg:8 span): CONDENSED PREVIEWS LINKED TO SUBPAGES
            ========================================================= */}
        <div id="right-column" className="lg:col-span-8 flex flex-col gap-6">
          {/* A. CONDENSED QUESTS PREVIEW */}
          <section className="border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="bg-red-600 text-white p-4 border-b-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="shrink-0 text-yellow" />
                <h2 className="text-base font-black uppercase italic tracking-tight">Active Quests (Preview)</h2>
              </div>
              <Link
                href="/tasks"
                className="bg-yellow-400 text-black font-black text-[10px] uppercase px-3 py-1 border-2 border-black hover:bg-yellow-350 transition flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <span>Full Page</span>
                <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>

            <div className="p-4 space-y-2.5 bg-zinc-50">
              {tasks.filter((t) => !t.completed).slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-zinc-350 bg-white">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Tidak ada Quest Aktif yang tersisa 🎉</p>
                </div>
              ) : (
                tasks
                  .filter((t) => !t.completed)
                  .slice(0, 3)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="border-2 border-black p-3 bg-white flex justify-between items-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTask(t.id)}
                          className="w-5 h-5 border-2 border-black hover:bg-zinc-100 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          {t.completed && <Check size={12} strokeWidth={4} />}
                        </button>
                        <span className="text-xs font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">{t.text}</span>
                      </div>
                      <span className="text-[8px] px-1 font-mono uppercase bg-amber-200 border border-black font-bold text-zinc-800">
                        {t.difficulty}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* B. CONDENSED FINANCIAL PREVIEW */}
          <section className="border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="bg-blue-600 text-white p-4 border-b-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="shrink-0 text-white" />
                <h2 className="text-base font-black uppercase italic tracking-tight">Cashflow Ledger (Preview)</h2>
              </div>
              <Link
                href="/transactions"
                className="bg-yellow-400 text-black font-black text-[10px] uppercase px-3 py-1 border-2 border-black hover:bg-yellow-350 transition flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <span>Full Ledger</span>
                <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>

            <div className="p-4 space-y-2.5 bg-zinc-50">
              {transactions.slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-zinc-350 bg-white">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Belum ada riwayat transaksi</p>
                </div>
              ) : (
                transactions.slice(0, 3).map((tr) => (
                  <div
                    key={tr.id}
                    className="border-2 border-black p-3 bg-white flex justify-between items-center font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 border-2 border-black flex items-center justify-center text-[10px] font-black shrink-0 ${
                          tr.type === 'income' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                        }`}
                      >
                        {tr.type === 'income' ? 'IN' : 'OT'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight text-neutral-900">{tr.text}</span>
                        <span className="text-[8px] bg-zinc-200 border border-zinc-450 px-1 self-start font-bold mt-0.5 text-zinc-800 uppercase">
                          {tr.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-black ${
                          tr.type === 'income' ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {tr.type === 'income' ? '+' : '-'} Rp{Math.abs(tr.amount).toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(tr.id)}
                        className="p-1 border border-black hover:bg-red-500 hover:text-white transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* C. CONDENSED HABITS PREVIEW */}
          <section className="border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="bg-emerald-600 text-white p-4 border-b-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="shrink-0 text-white" />
                <h2 className="text-base font-black uppercase italic tracking-tight">Active Habits (Preview)</h2>
              </div>
              <Link
                href="/habits"
                className="bg-yellow-400 text-black font-black text-[10px] uppercase px-3 py-1 border-2 border-black hover:bg-yellow-350 transition flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <span>Full Habit Tracker</span>
                <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>

            <div className="p-4 space-y-2.5 bg-zinc-50">
              {habits.slice(0, 3).length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-zinc-350 bg-white">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Belum ada target kebiasaan</p>
                </div>
              ) : (
                habits.slice(0, 3).map((h) => (
                  <div
                    key={h.id}
                    className="border-2 border-black p-3 bg-white flex justify-between items-center shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-sm">{h.text}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase">STREAK:</span>
                      <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase flex items-center gap-0.5">
                        <Flame size={10} className="fill-white" /> {h.streak} DAYS
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

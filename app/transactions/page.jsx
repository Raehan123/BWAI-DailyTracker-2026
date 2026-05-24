'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Coins,
  DollarSign,
  PieChart,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import HeaderAndNav from '../../components/HeaderAndNav';
import { playSound } from '../../lib/sound';
import {
  INITIAL_TRANSACTIONS,
  loadState,
  saveState
} from '../../lib/state';

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Ledger state
  const [transactions, setTransactions] = useState([]);
  const [transText, setTransText] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transType, setTransType] = useState('expense'); // expense | income
  const [transCategory, setTransCategory] = useState('Jajan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Hydration state load & settings preloader on mount
  useEffect(() => {
    setTimeout(() => {
      setTransactions(loadState('neo_transactions', INITIAL_TRANSACTIONS));
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
      saveState('neo_transactions', transactions);
    }
  }, [transactions, mounted]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const currentBalance = totalIncome - totalExpense;

  // Handlers
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

  const handleDeleteTransaction = (id) => {
    playSound('delete', soundEnabled);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearLedger = () => {
    if (window.confirm('Yakin ingin mereset seluruh histori pembukuan keuangan Anda?')) {
      playSound('delete', soundEnabled);
      setTransactions([]);
    }
  };

  // Searching + Filtering
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'Jajan', 'Project', 'Saku', 'Belanja', 'Pribadi'];

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

      {/* BALANCE STATS GRID (Hero block) */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-4 border-black divide-y-4 md:divide-y-0 md:divide-x-4 divide-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center font-mono uppercase">
        {/* Balances */}
        <div className="p-4 bg-yellow-400 flex flex-col justify-center items-center">
          <span className="text-[10px] font-black text-black flex items-center gap-1">
            <Coins size={12} /> CURRENT STASH BALANCE
          </span>
          <span className="text-xl md:text-3xl font-black mt-1 text-black">
            Rp {currentBalance.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total In */}
        <div className="p-4 bg-emerald-300 flex flex-col justify-center items-center">
          <span className="text-[10px] font-black text-emerald-900 flex items-center gap-1">
            <TrendingUp size={12} /> TOTAL CASH INFLOW
          </span>
          <span className="text-lg md:text-2xl font-black mt-1 text-emerald-950">
            + Rp {totalIncome.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total Out */}
        <div className="p-4 bg-red-300 flex flex-col justify-center items-center">
          <span className="text-[10px] font-black text-red-900 flex items-center gap-1">
            <TrendingDown size={12} /> TOTAL OUTFLOW
          </span>
          <span className="text-lg md:text-2xl font-black mt-1 text-red-950">
            - Rp {totalExpense.toLocaleString('id-ID')}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ADD TRANSACTION FORM */}
        <section className="lg:col-span-4 border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="bg-blue-600 text-white p-4 border-b-4 border-black flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400 shrink-0" />
            <h2 className="text-sm font-black uppercase italic tracking-tight">Post Cash Record</h2>
          </div>

          <form onSubmit={handleAddTransaction} className="p-4 space-y-4 bg-zinc-100">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setTransType('expense');
                }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${
                  transType === 'expense'
                    ? 'bg-red-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-zinc-500 hover:text-black'
                }`}
              >
                💸 EXPENSE (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setTransType('income');
                }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${
                  transType === 'income'
                    ? 'bg-green-500 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-zinc-500 hover:text-black'
                }`}
              >
                💰 INCOME (+)
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                📝 Deskripsi Transaksi
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Honor ngerjain landing page..."
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                  💰 Jumlah (IDR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={transAmount}
                  onChange={(e) => setTransAmount(e.target.value)}
                  className="w-full bg-white text-black border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                  🏷️ Kategori
                </label>
                <select
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
              type="submit"
              className="w-full border-3 border-black bg-blue-600 text-white font-black uppercase py-3 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-blue-650 transition cursor-pointer"
            >
              🧾 CATAT BUKU ARUS KAS
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: DETAILED TRANSACTIONS LIST */}
        <section className="lg:col-span-8 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col font-mono text-xs">
          <div className="bg-zinc-950 text-white p-4 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-yellow-400 shrink-0" />
              <h2 className="text-sm font-black uppercase italic tracking-tight">Main Ledger entries ({transactions.length})</h2>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={handleClearLedger}
                className="bg-red-500 text-white hover:bg-red-600 px-2.5 py-1 border border-black font-bold uppercase text-[9px] shadow-[1px_1px_0px_rgba(255,255,255,1)] cursor-pointer"
              >
                Reset Ledger
              </button>
            )}
          </div>

          {/* Search Table Toolbar */}
          <div className="p-3 border-b-3 border-black bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-2 border-black p-1.5 px-3 pl-8 text-[11px] font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none w-full"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-bold uppercase text-zinc-500 mr-1 flex items-center gap-0.5">
                <Filter size={10} /> Cat:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCategory(cat);
                  }}
                  className={`px-2 py-0.5 border border-black uppercase text-[9px] font-bold cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {cat === 'ALL' ? 'ALL' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-4 bg-zinc-100 min-h-[350px] space-y-2 max-h-[500px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 border-4 border-dashed border-zinc-400 bg-white">
                <p className="text-xs text-zinc-500 font-bold uppercase">LEDGER TRANSAKSI KOSONG / TIDAK DITEMUKAN 📊</p>
              </div>
            ) : (
              filteredTransactions.map((tr) => (
                <div
                  key={tr.id}
                  className="border-2 border-black p-3 bg-white flex justify-between items-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-55"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center text-xs font-black shrink-0 ${
                        tr.type === 'income' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                      }`}
                    >
                      {tr.type === 'income' ? 'IN' : 'OT'}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 leading-tight">{tr.text}</span>
                      <span className="text-[9px] bg-zinc-200 border border-zinc-400 px-1 py-0.2 self-start font-black mt-0.5 text-black uppercase">
                        {tr.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs md:text-sm font-black ${
                        tr.type === 'income' ? 'text-green-700 font-extrabold' : 'text-red-700 font-extrabold'
                      }`}
                    >
                      {tr.type === 'income' ? '+' : '-'} Rp{Math.abs(tr.amount).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tr.id)}
                      className="p-1 px-1.5 border border-black bg-zinc-900 text-white hover:bg-red-500 hover:text-white cursor-pointer transition"
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
      </div>
    </div>
  );
}

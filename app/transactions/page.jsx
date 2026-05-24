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

      {/* BALANCE STATS GRID (Hero block) */}
      <section className="grid grid-cols-1 md:grid-cols-3 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/5 bg-slate-900/[0.25] backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] text-center font-sans uppercase">
        {/* Balances */}
        <div className="p-5 flex flex-col justify-center items-center bg-white/[0.01] hover:bg-white/[0.02] transition duration-300">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <Coins size={13} className="text-indigo-400" /> CURRENT STASH BALANCE
          </span>
          <span className="text-xl md:text-2xl font-bold mt-1 text-slate-100">
            Rp {currentBalance.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total In */}
        <div className="p-5 flex flex-col justify-center items-center bg-white/[0.01] hover:bg-white/[0.02] transition duration-300">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-400" /> TOTAL CASH INFLOW
          </span>
          <span className="text-lg md:text-xl font-bold mt-1 text-emerald-400">
            + Rp {totalIncome.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total Out */}
        <div className="p-5 flex flex-col justify-center items-center bg-white/[0.01] hover:bg-white/[0.02] transition duration-300">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <TrendingDown size={13} className="text-rose-450" /> TOTAL OUTFLOW
          </span>
          <span className="text-lg md:text-xl font-bold mt-1 text-rose-400">
            - Rp {totalExpense.toLocaleString('id-ID')}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ADD TRANSACTION FORM */}
        <section className="lg:col-span-4 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400 shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Post Cash Record</h2>
          </div>

          <form onSubmit={handleAddTransaction} className="p-5 space-y-4 bg-transparent">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setTransType('expense');
                }}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-xl transition duration-300 ${
                  transType === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-slate-400'
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
                className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-xl transition duration-300 ${
                  transType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-slate-400'
                }`}
              >
                💰 INCOME (+)
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                📝 Deskripsi Transaksi
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Honor ngerjain landing page..."
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  💰 Jumlah (IDR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={transAmount}
                  onChange={(e) => setTransAmount(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  🏷️ Kategori
                </label>
                <select
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
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer mt-1"
            >
              🧾 CATAT BUKU ARUS KAS
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: DETAILED TRANSACTIONS LIST */}
        <section className="lg:col-span-8 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-400 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Main Ledger Entries ({transactions.length})</h2>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={handleClearLedger}
                className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border border-rose-500/20 px-3.5 py-1.5 rounded-lg font-bold uppercase text-[9px] tracking-wide transition-all cursor-pointer shadow-sm"
              >
                Reset Ledger
              </button>
            )}
          </div>

          {/* Search Table Toolbar */}
          <div className="p-4 border-b border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 pl-9 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 w-full shadow-sm"
              />
              <Search size={12} className="absolute left-3 top-3.5 text-slate-500" />
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-sans">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-2 flex items-center gap-0.5">
                <Filter size={10} /> Cat:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg border uppercase text-[9px] font-bold tracking-wider cursor-pointer shrink-0 transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat === 'ALL' ? 'ALL' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-5 bg-transparent min-h-[350px] space-y-3 max-h-[500px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-widest">LEDGER TRANSAKSI KOSONG / TIDAK DITEMUKAN 📊</p>
              </div>
            ) : (
              filteredTransactions.map((tr) => (
                <div
                  key={tr.id}
                  className="border border-white/5 p-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl flex justify-between items-center transition duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black shrink-0 ${
                        tr.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/15 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      {tr.type === 'income' ? 'IN' : 'OT'}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-100 leading-tight">{tr.text}</span>
                      <span className="text-[8px] bg-white/5 border border-white/5 rounded px-2 py-0.5 self-start font-bold mt-1 text-slate-400 uppercase tracking-wide">
                        {tr.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs md:text-sm font-bold ${
                        tr.type === 'income' ? 'text-emerald-400' : 'text-rose-450'
                      }`}
                    >
                      {tr.type === 'income' ? '+' : '-'} Rp{Math.abs(tr.amount).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tr.id)}
                      className="p-1.5 border border-white/10 hover:border-rose-500/30 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer shrink-0"
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

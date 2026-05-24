'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Flame,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  VolumeX
} from 'lucide-react';
import HeaderAndNav from '../../components/HeaderAndNav';
import { playSound } from '../../lib/sound';
import {
  INITIAL_HABITS,
  loadState,
  saveState
} from '../../lib/state';

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Habits State
  const [habits, setHabits] = useState([]);
  const [habitText, setHabitText] = useState('');

  // Hydration state load & settings preloader on mount
  useEffect(() => {
    setTimeout(() => {
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

  // Save to LS when state changes
  useEffect(() => {
    if (mounted) {
      saveState('neo_habits', habits);
    }
  }, [habits, mounted]);

  // Actions
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

  const handleToggleHabitDay = (habitId, dayName) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const updatedDays = { ...h.days, [dayName]: !h.days[dayName] };
          
          let nextStreak = h.streak;
          if (updatedDays[dayName]) {
            playSound('success', soundEnabled);
            nextStreak = Math.min(nextStreak + 1, 30);
          } else {
            playSound('click', soundEnabled);
            nextStreak = Math.max(nextStreak - 1, 0);
          }

          return {
            ...h,
            days: updatedDays,
            streak: nextStreak,
          };
        }
        return h;
      })
    );
  };

  const handleDeleteHabit = (id) => {
    playSound('delete', soundEnabled);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const dayKeys = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ADD HABIT FORM */}
        <section className="lg:col-span-4 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400 shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Register New Habit</h2>
          </div>

          <form onSubmit={handleAddHabit} className="p-5 space-y-4 bg-transparent">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                🎯 Nama Kebiasaan Baru / Streak Target
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Membaca buku coding 15 menit..."
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
              />
            </div>

            <p className="text-[10px] leading-relaxed text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
              💡 <strong>Tips Pembentukan Kebiasaan:</strong> Mulailah dengan target kecil yang mudah dipenuhi secara konsisten setiap harinya. Centang hari di matriks sebelah kanan untuk melacak kemajuan Anda berlapis-lapis!
            </p>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              🔄 TRACK NEW HABIT
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: DETAILED HABIT MATRIX GRID */}
        <section className="lg:col-span-8 border border-white/10 bg-slate-900/[0.25] backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="bg-white/[0.04] text-white p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-indigo-400 shrink-0 animate-spin-slow" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Weekly Habit Matrix ({habits.length})</h2>
            </div>
          </div>

          <div className="p-5 bg-transparent space-y-4 min-h-[400px]">
            {habits.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">BELUM ADA HABIT YANG TERDAFTAR ATAU TERPILIH 🏃‍♂️</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="border border-white/5 p-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl flex flex-col gap-3 shadow-md transition duration-300"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-100 leading-tight">
                          {h.text}
                        </h3>
                        {/* Interactive Sparkle indicator */}
                        <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] text-slate-400 uppercase">
                          <span className="font-sans font-bold">Status:</span>
                          <span className={`font-bold ${h.streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                            {h.streak > 0 ? '🌋 IN STREAK MODE' : '☕ COLD START'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Flame Streak Pill */}
                        <div className="bg-orange-500/10 text-orange-300 font-bold text-[10px] px-2.5 py-1 border border-orange-500/25 rounded-lg tracking-wider uppercase flex items-center gap-1 select-none">
                          <Flame size={12} className="fill-orange-400/20" />
                          <span>STREAK: {h.streak} DAYS</span>
                        </div>

                        <button
                          onClick={() => handleDeleteHabit(h.id)}
                          className="p-1.5 border border-white/10 hover:border-rose-500/30 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Kebiasaan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Weekly Checks Matrices */}
                    <div className="border border-white/5 bg-black/20 p-3 rounded-2xl grid grid-cols-7 gap-1 font-mono text-center">
                      {dayKeys.map((day) => {
                        const isChecked = h.days[day];
                        return (
                          <div key={day} className="flex flex-col items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {day}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleHabitDay(h.id, day)}
                              className={`w-8 h-8 md:w-10 md:h-10 border rounded-xl flex items-center justify-center transition cursor-pointer font-bold text-xs ${
                                isChecked
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {isChecked ? '✓' : ''}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

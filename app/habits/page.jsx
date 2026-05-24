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
        {/* LEFT COLUMN: ADD HABIT FORM */}
        <section className="lg:col-span-4 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="bg-emerald-600 text-white p-4 border-b-4 border-black flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400 shrink-0" />
            <h2 className="text-sm font-black uppercase italic tracking-tight">Register New Habit</h2>
          </div>

          <form onSubmit={handleAddHabit} className="p-4 space-y-4 bg-zinc-100">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1 font-mono">
                🎯 Nama Kebiasaan Baru / Streak Target
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Membaca buku coding 15 menit..."
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                className="w-full bg-white text-black border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>

            <p className="text-[10px] font-mono leading-relaxed text-slate-800 bg-amber-100 border border-black border-dashed p-3">
              💡 <strong>Tips Pembentukan Kebiasaan:</strong> Mulailah dengan target kecil yang mudah dipenuhi secara konsisten setiap harinya. Centang hari di matriks sebelah kanan untuk melacak kemajuan Anda berlapis-lapis!
            </p>

            <button
              type="submit"
              className="w-full border-3 border-black bg-emerald-500 text-black font-black uppercase py-3 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-emerald-450 transition cursor-pointer"
            >
              🔄 TRACK NEW HABIT
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: DETAILED HABIT MATRIX GRID */}
        <section className="lg:col-span-8 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="bg-zinc-950 text-white p-4 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-yellow-400 shrink-0 animate-spin-slow" />
              <h2 className="text-sm font-black uppercase italic tracking-tight">Weekly Habit Matrix ({habits.length})</h2>
            </div>
          </div>

          <div className="p-4 bg-zinc-100 space-y-4 min-h-[400px]">
            {habits.length === 0 ? (
              <div className="text-center py-16 border-4 border-dashed border-zinc-400 bg-white">
                <p className="text-xs font-mono text-zinc-500 font-bold uppercase">BELUM ADA HABIT YANG TERDAFTAR ATAU TERPILIH 🏃‍♂️</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="border-3 border-black p-4 bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-xs md:text-sm font-black text-zinc-900 leading-tight">
                          {h.text}
                        </h3>
                        {/* Interactive Sparkle indicator */}
                        <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-zinc-500 uppercase">
                          <span>Status:</span>
                          <span className={`font-bold ${h.streak > 0 ? 'text-orange-600' : 'text-zinc-550'}`}>
                            {h.streak > 0 ? '🌋 IN STREAK MODE' : '☕ COLD START'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Flame Streak Pill */}
                        <div className="bg-orange-500 text-white font-black text-[10px] px-2.5 py-1 border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                          <Flame size={12} className="fill-white" />
                          <span>STREAK: {h.streak} DAYS</span>
                        </div>

                        <button
                          onClick={() => handleDeleteHabit(h.id)}
                          className="p-1 px-1.5 border-2 border-black bg-zinc-955 text-white hover:bg-red-500 hover:text-white cursor-pointer transition"
                          title="Hapus Kebiasaan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Weekly Checks Matrices */}
                    <div className="border-2 border-black bg-zinc-50 p-3 grid grid-cols-7 gap-1 font-mono text-center">
                      {dayKeys.map((day) => {
                        const isChecked = h.days[day];
                        return (
                          <div key={day} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-zinc-650 uppercase">
                              {day}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleHabitDay(h.id, day)}
                              className={`w-8 h-8 md:w-10 md:h-10 border-2 border-black flex items-center justify-center transition cursor-pointer font-black text-xs ${
                                isChecked
                                  ? 'bg-emerald-500 text-black shadow-none'
                                  : 'bg-white hover:bg-zinc-200 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
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

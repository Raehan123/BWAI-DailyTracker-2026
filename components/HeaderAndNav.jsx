'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HeaderAndNav() {
  const pathname = usePathname();
  const [curTime, setCurTime] = useState('');
  const [curDate, setCurDate] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Dynamic user session tracker
  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('neo_current_user');
        if (user) {
          try {
            setCurrentUser(JSON.parse(user));
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };

    loadUser();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadUser);
      window.addEventListener('neo_auth_change', loadUser);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', loadUser);
        window.removeEventListener('neo_auth_change', loadUser);
      }
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neo_current_user');
      setCurrentUser(null);
      window.dispatchEvent(new Event('neo_auth_change'));
      window.location.reload();
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurTime(now.toLocaleTimeString('id-ID', { hour12: false }));
      setCurDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/tasks', label: 'Quest Log (Tasks)', icon: CheckSquare },
    { href: '/transactions', label: 'Ledger (Uang)', icon: CreditCard },
    { href: '/habits', label: 'Habit Tracker', icon: RefreshCw },
  ];

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* HEADER BILLBOARD */}
      <header
        id="app-header"
        className="border border-theme-card-border bg-theme-header-bg backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-theme-shadow transition-all duration-300"
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-theme-text select-none transition-colors duration-300">
            Mindful Days
          </h1>
          <p className="text-theme-muted text-xs md:text-sm font-medium mt-1.5 uppercase tracking-wide transition-colors duration-300">
            Status: <span className="text-emerald-500 font-bold">Online</span> | User:{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentUser ? currentUser.name : 'Neo_User_01'}</span> | Mode:{' '}
            <span className="text-violet-600 dark:text-violet-400 font-bold">Dynamic UI</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-10">
          {/* Time & Clock Stash */}
          <div className="flex-1 sm:flex-initial flex min-w-[240px] border border-theme-card-border bg-theme-item-bg backdrop-blur-md rounded-2xl p-2.5 px-4 h-12 items-center justify-between font-mono text-xs shadow-md transition-all duration-300">
            <div className="flex flex-col justify-center items-start">
              <span className="text-[9px] uppercase tracking-wider text-theme-muted font-sans font-bold transition-colors duration-300">SYS TIME</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider transition-colors duration-300">
                {curTime || '00:00:00'}
              </span>
            </div>
            <div className="h-full w-[1px] bg-theme-card-border mx-3 transition-colors duration-300"></div>
            <div className="flex flex-col justify-center items-end text-right">
              <span className="text-[9px] uppercase tracking-wider text-theme-muted font-sans font-bold transition-colors duration-300">CALENDAR</span>
              <span className="text-[10px] uppercase font-semibold text-theme-text opacity-90 tracking-tight leading-tight w-28 truncate transition-colors duration-300">
                {curDate ? curDate.split(',')[1]?.trim() || curDate : 'HARI INI'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Logout Button */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold px-4 py-2 border border-rose-500/30 text-xs uppercase rounded-2xl shadow-md transition-all duration-300 cursor-pointer h-12 flex items-center justify-center gap-2"
              >
                LOGOUT
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SYSTEM NAVIGATION (Interactive Glassmorphic Tabs) */}
      <nav id="app-nav" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center gap-2 border p-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-300 rounded-2xl select-none ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 shadow-lg shadow-indigo-600/5'
                  : 'bg-theme-item-bg border-theme-item-border text-theme-muted hover:bg-theme-item-bg-hover hover:text-theme-text'
              }`}
            >
              <IconComponent size={15} className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-theme-muted'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

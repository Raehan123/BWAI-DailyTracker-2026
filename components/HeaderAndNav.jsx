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
    <div className="flex flex-col gap-4">
      {/* HEADER BILLBOARD */}
      <header
        id="app-header"
        className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none"></div>

        <div className="relative z-10">

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none select-none">
            Mindful Days
          </h1>
          <p className="text-zinc-700 text-xs md:text-sm font-semibold mt-2 uppercase tracking-tight">
            Status: <span className="text-green-600 font-bold">Online</span> | User:{' '}
            <span className="text-purple-700 font-extrabold">{currentUser ? currentUser.name : 'Neo_User_01'}</span> | Mode:{' '}
            <span className="text-blue-600 font-bold">Multiple Page</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto relative z-10">
          {/* Time & Clock Stash */}
          <div className="flex min-w-[220px] border-3 border-black bg-zinc-950 text-white p-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] h-12 items-center justify-between font-mono text-xs">
            <div className="flex flex-col justify-center items-start">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">SYS TIME</span>
              <span className="text-sm font-black text-yellow-500 tracking-wider">
                {curTime || '00:00:00'}
              </span>
            </div>
            <div className="h-full w-[1px] bg-zinc-700 mx-2"></div>
            <div className="flex flex-col justify-center items-end text-right">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">CALENDAR</span>
              <span className="text-[10px] uppercase font-bold text-white tracking-tight leading-tight w-28 truncate">
                {curDate ? curDate.split(',')[1]?.trim() || curDate : 'HARI INI'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-extrabold px-4 py-2 border-3 border-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer h-12 flex items-center justify-center gap-2"
            >
              KELUAR / LOGOUT
            </button>
          )}
        </div>
      </header>

      {/* SYSTEM NAVIGATION (Interactive Neo-Brutalist Tabs) */}
      <nav id="app-nav" className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center gap-2 border-3 border-black p-3 text-xs md:text-sm font-black uppercase tracking-tight text-center cursor-pointer transition-all duration-100 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none select-none ${
                isActive
                  ? 'bg-zinc-900 text-yellow-400 font-black'
                  : 'bg-white text-zinc-800'
              }`}
            >
              <IconComponent size={16} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

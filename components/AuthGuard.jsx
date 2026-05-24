'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Mail, User, ShieldAlert, ArrowRight, CornerDownLeft, Eye, EyeOff } from 'lucide-react';

export default function AuthGuard({ children }) {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Authentication screen states: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Show/hide passwords
  const [showPassword, setShowPassword] = useState(false);

  // Status/Error notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hydration protection & Initial user loading
  useEffect(() => {
    setTimeout(() => {
      // Load current active user
      const user = localStorage.getItem('neo_current_user');
      if (user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch (e) {
          setCurrentUser(null);
        }
      }

      // Initialize default admin user if no users exist
      const existingUsers = localStorage.getItem('neo_users');
      if (!existingUsers) {
        const defaultUsers = [
          {
            email: 'rayhan@mindful.com',
            password: 'password123',
            name: 'Neo_User_01'
          }
        ];
        localStorage.setItem('neo_users', JSON.stringify(defaultUsers));
      }
      setMounted(true);
    }, 0);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Harap isi semua kolom!');
      return;
    }

    const usersStr = localStorage.getItem('neo_users');
    let users = [];
    if (usersStr) {
      try {
        users = JSON.parse(usersStr);
      } catch (e) {
        users = [];
      }
    }

    // Find user
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      setErrorMsg('Email / Pengguna tidak ditemukan!');
      return;
    }

    if (foundUser.password !== password) {
      setErrorMsg('Password yang Anda masukkan salah!');
      return;
    }

    // Success!
    const sessionUser = {
      email: foundUser.email,
      name: foundUser.name
    };
    localStorage.setItem('neo_current_user', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    
    // Dispatch session event to notify HeaderAndNav
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('neo_auth_change'));
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !fullName || !password || !confirmPassword) {
      setErrorMsg('Harap lengkapi semua data pendaftaran!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal harus memiliki 6 karakter!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok!');
      return;
    }

    const usersStr = localStorage.getItem('neo_users') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    // Check if email already registered
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setErrorMsg('Email ini sudah terdaftar sebelumnya!');
      return;
    }

    // Register user
    const newUser = {
      email: email.trim(),
      password: password,
      name: fullName.trim()
    };

    users.push(newUser);
    localStorage.setItem('neo_users', JSON.stringify(users));

    setSuccessMsg('Pendaftaran Berhasil! Silakan masuk dengan akun baru Anda.');
    setAuthMode('login');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Masukkan alamat email Anda!');
      return;
    }

    const usersStr = localStorage.getItem('neo_users') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      setErrorMsg('Email tidak ditemukan di dalam sistem!');
      return;
    }

    // Simulation: Reset password instantly for showcase or show password
    setSuccessMsg(`🔑 AKUN DITEMUKAN: Password Anda adalah "${foundUser.password}". Silakan salin password ini untuk masuk.`);
  };

  const handleDemoLogin = () => {
    setEmail('rayhan@mindful.com');
    setPassword('password123');
    setErrorMsg('');
    setSuccessMsg('Kredensial demo diisi otomatis. Klik tombol MASUK.');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans text-slate-100">
        <div className="border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">Memuat Gerbang Autentikasi...</span>
        </div>
      </div>
    );
  }

  // If logged in, render the app pages
  if (currentUser) {
    return <>{children}</>;
  }

  // Render Authentication Container
  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-slate-950 flex items-center justify-center selection:bg-indigo-500/50 selection:text-white relative">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[20%] left-[30%] w-[250px] h-[250px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[250px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl relative overflow-hidden flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="relative z-10 text-center">
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 px-3 py-1 rounded-full inline-block mb-3 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            🔐 AUTH REQUIRED
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            Mindful Days
          </h1>
          <p className="text-slate-400 text-xs font-medium tracking-wide mt-2">
            Satu-satunya Jurnal & Super App Harian Anda
          </p>
        </div>

        {/* Inner Glass Card Content Area */}
        <div className="relative z-10 bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-inner">
          {/* Form Tabs */}
          <div className="grid grid-cols-3 bg-white/[0.04] border border-white/5 p-1 rounded-xl mb-5 gap-1">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-center rounded-lg cursor-pointer transition-all duration-300 ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-center rounded-lg cursor-pointer transition-all duration-300 ${
                authMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              REGISTER
            </button>
            <button
              onClick={() => {
                setAuthMode('forgot');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-center rounded-lg cursor-pointer transition-all duration-300 ${
                authMode === 'forgot'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              FORGOT
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold text-xs rounded-xl p-3 flex items-center gap-2.5 animate-pulse">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold text-xs rounded-xl p-3 flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-emerald-400">
                <Sparkles size={16} className="shrink-0" />
                <span className="font-bold tracking-wider uppercase text-[10px]">INFORMASI SISTEM:</span>
              </span>
              <p className="font-mono text-[11px] normal-case bg-black/40 border border-white/5 p-2 rounded-lg leading-relaxed text-slate-200">
                {successMsg}
              </p>
            </div>
          )}

          {/* Form: LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 font-sans">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  📧 Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  🔑 Kata Sandi / Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Key size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 pr-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 hover:text-indigo-400 transition cursor-pointer text-slate-400"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
              >
                MASUK SEKARANG <ArrowRight size={13} className="inline ml-1" />
              </button>

              <div className="border-t border-white/10 pt-4 mt-2 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-indigo-300 p-2 px-4 uppercase text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-200 shadow-sm"
                >
                  ⚡ GUNAKAN KUNCI DEMO INSTAN
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4 font-sans">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  👤 Nama Lengkap Anda
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="cth. Neo Rayhan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  📧 Alamat Email Baru
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  🔑 Buat Kata Sandi (min. 6)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Key size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sandi minimal 6 huruf..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  🔁 Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Key size={15} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Ketik kembali sandi..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>DAFTAR AKUN BARU</span>
                <CornerDownLeft size={13} className="shrink-0" />
              </button>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 font-sans">
              <p className="text-[10px] leading-relaxed text-yellow-200 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl mb-1">
                ℹ️ Masukkan email terdaftar Anda untuk melihat password secara instan demi kemudahan demo Anda.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  📧 Alamat Email Anda
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Email terdaftar..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 p-3 pl-10 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-200 to-slate-350 hover:from-white hover:to-slate-200 text-slate-950 font-bold uppercase py-3 text-xs tracking-wider rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer mt-2"
              >
                PULIHKAN SANDI SEKARANG
              </button>
            </form>
          )}
        </div>

        {/* System Credits Footing */}
        <div className="relative z-10 text-center font-mono text-[9px] text-slate-500 tracking-wider">
          Mindful Days v1.5.0 • Powered by Glassmorphic Engine
        </div>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen bg-zinc-300 flex items-center justify-center font-mono">
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-4 border-black border-t-transparent"></div>
          <span className="font-extrabold uppercase">Memuat Gerbang Autentikasi...</span>
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
    <div className="min-h-screen py-10 px-4 md:px-8 bg-zinc-300 flex items-center justify-center selection:bg-yellow-400 selection:text-black">
      <div className="border-4 border-black bg-white p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-6">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 text-center">
          <span className="bg-blue-600 text-white text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2.5 py-0.5 inline-block mb-3">
            🔐 AUTH REQUIRED
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none select-none">
            Mindful Days
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-tight mt-1.5">
            Satu-satunya Jurnal & Super App Harian Anda
          </p>
        </div>

        {/* Inner Content Area */}
        <div className="relative z-10 bg-zinc-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Form Tabs */}
          <div className="grid grid-cols-3 border-2 border-black bg-zinc-950 p-0.5 mb-4 gap-0.5">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-1.5 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                authMode === 'login'
                  ? 'bg-yellow-400 text-black border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-850 text-zinc-400 hover:text-white'
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
              className={`py-1.5 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                authMode === 'register'
                  ? 'bg-yellow-400 text-black border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-850 text-zinc-400 hover:text-white'
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
              className={`py-1.5 text-[10px] sm:text-xs font-black uppercase text-center cursor-pointer transition ${
                authMode === 'forgot'
                  ? 'bg-yellow-400 text-black border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              FORGOT
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 bg-red-400 text-black font-extrabold text-xs uppercase p-2.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-400 text-black font-extrabold text-xs uppercase p-2.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="shrink-0" />
                <span>INFORMASI SISTEM:</span>
              </span>
              <p className="font-mono text-[11px] normal-case bg-white border border-black p-1.5 mt-1 font-semibold leading-relaxed">
                {successMsg}
              </p>
            </div>
          )}

          {/* Form: LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3 font-mono">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  📧 Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  🔑 Kata Sandi / Password
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Key size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 pr-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 hover:text-blue-600 transition cursor-pointer text-black"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full border-3 border-black bg-blue-600 text-white font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition cursor-pointer mt-2"
              >
                MASUK SEKARANG <ArrowRight size={12} className="inline ml-1" />
              </button>

              <div className="border-t-2 border-black border-dashed pt-3 mt-1 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="bg-zinc-950 text-yellow-400 border-2 border-black p-1.5 px-3 uppercase text-[9px] font-black cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-900"
                >
                  ⚡ GUNAKAN KUNCI DEMO INSTAN
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3 font-mono">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  👤 Nama Lengkap Anda
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="cth. Neo Rayhan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  📧 Alamat Email Baru
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  🔑 Buat Kata Sandi (min. 6)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Key size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Buat sandi rumit..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  🔁 Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang sandi..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full border-3 border-black bg-emerald-500 text-black font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer mt-2"
              >
                DAFTAR AKUN BARU <CornerDownLeft size={12} className="inline ml-1" />
              </button>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3 font-mono">
              <p className="text-[10px] leading-tight text-neutral-800 bg-amber-200 border border-black p-2 rounded-none mb-1">
                ℹ️ Masukkan email terdaftar Anda untuk melihat password secara instan.
              </p>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                  📧 Alamat Email Anda
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-black">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Email yang mau dilacak..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-black border-2 border-black p-2 pl-9 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full border-3 border-black bg-zinc-950 text-white font-black uppercase py-2.5 text-xs tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer mt-2"
              >
                PULIHKAN SANDI SEKARANG
              </button>
            </form>
          )}
        </div>

        {/* System Credits Footing */}
        <div className="relative z-10 text-center font-mono text-[9px] text-zinc-500">
          Mindful Days v1.5.0 • Powered by Retro Engine
        </div>
      </div>
    </div>
  );
}

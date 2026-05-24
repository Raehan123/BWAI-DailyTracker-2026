'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  Zap,
  Flame,
  MessageSquare
} from 'lucide-react';
import { loadState, INITIAL_TASKS, INITIAL_TRANSACTIONS, INITIAL_HABITS } from '../lib/state';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedChat = localStorage.getItem('sora_chat_history');
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          if (parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to restore chat history', e);
        }
      }
    }
    return [
      {
        id: 'greeting',
        role: 'model',
        text: 'Halo! Saya **Buddy**, asisten cerdas Mindful Days Anda. 🌸\n\nSaya mengerti agenda kegiatan, status finansial, dan habit harian Anda saat ini. Ada yang bisa saya bantu analisis atau motivasi hari ini?',
        timestamp: new Date()
      }
    ];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Chat scroll anchor
  const messagesEndRef = useRef(null);

  // Smooth scroll to latest chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Save chat history
  const saveChatHistory = (history) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sora_chat_history', JSON.stringify(history));
    }
  };

  // Sound playback helpers
  const playSoundEffect = (type) => {
    if (typeof window === 'undefined') return;
    try {
      const soundOn = localStorage.getItem('neo_sound');
      if (soundOn === 'false') return;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'delete') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Ignored if audio context is blocked by user interaction gesture requirement
    }
  };

  // Helper to fetch live dashboard context
  const getDashboardContext = () => {
    const tasks = loadState('neo_tasks', INITIAL_TASKS);
    const transactions = loadState('neo_transactions', INITIAL_TRANSACTIONS);
    const habits = loadState('neo_habits', INITIAL_HABITS);

    const activeTasks = tasks.filter(t => !t.completed).map(t => `${t.text} (kesulitan: ${t.difficulty})`);
    
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    const balance = totalIncome - totalExpense;

    const recentTransactions = transactions.slice(0, 5).map(t => `${t.text}: Rp ${t.amount.toLocaleString('id-ID')} (${t.category})`);
    const habitsList = habits.map(h => `${h.text} (Streak: ${h.streak} hari)`);

    return {
      tasksCount: activeTasks.length,
      activeTasks,
      totalIncome,
      totalExpense,
      balance,
      recentTransactions,
      habits: habitsList
    };
  };

  // Trigger Gemini API to send message
  const sendMessageToSora = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    playSoundEffect('tick');

    const newUserMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    saveChatHistory(nextMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = getDashboardContext();

      // Format previous 10 messages to keep history lightweight but contextual
      const cleanHistory = nextMessages
        .slice(-10)
        .filter(m => m.id !== 'greeting')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: cleanHistory,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon dari server.');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const newBotMessage = {
        id: 'reply_' + Date.now(),
        role: 'model',
        text: data.reply,
        timestamp: new Date()
      };

      const updatedHistory = [...nextMessages, newBotMessage];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);
      playSoundEffect('success');
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: `⚠️ **Error:** Waduh, koneksi ke asisten digital terputus. Pastikan koneksi Anda lancar atau ulangi kembali sebentar lagi.\n\n*(Detail: ${err.message || 'Server timeout'})*`,
        timestamp: new Date()
      };
      const updatedHistory = [...nextMessages, errorMsg];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessageToSora(inputMessage);
    }
  };


  const handlePresetClick = (presetType) => {
    let prompt = '';
    if (presetType === 'finance') {
      prompt = 'Bantu saya melakukan analisis pengeluaran & kondisi finansial saya saat ini. Berikan kesimpulan praktis dan tips cerdas agar saya bisa menabung lebih produktif.';
    } else if (presetType === 'quests') {
      prompt = 'Tolong berikan rekomendasi 3 Quest Harian (tugas baru) produktif yang kreatif dan menantang, yang bisa saya lakukan terkait peningkatan kompetensi pribadi.';
    } else if (presetType === 'motivation') {
      prompt = 'Semangati saya agar terus disiplin melakukan habit streak saya! Mengapa kedisiplinan beruntun ini penting menurut sudut pandang motivasi produktivitas?';
    }
    sendMessageToSora(prompt);
  };

  // Render text containing simple markdown
  const renderMessageText = (text) => {
    return text.split('\n').map((line, lineIndex) => {
      // Bold rendering **text**
      let parts = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-indigo-700">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Check bullet point lines like "- word" or "* word"
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().replace(/^[-*]\s+/, '') : line;

      if (isBullet) {
        return (
          <li key={lineIndex} className="ml-4 list-disc text-slate-700 leading-relaxed text-xs my-0.5">
            {parts.length > 0 ? parts : cleanLine}
          </li>
        );
      }

      return (
        <p key={lineIndex} className="text-slate-700 leading-relaxed text-xs my-1">
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="assistant-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSoundEffect('tick');
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_12px_32px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.4)] border border-indigo-400/20 cursor-pointer ${
            isOpen ? 'bg-slate-900 border-slate-700/50' : ''
          }`}
        >
          <Sparkles size={16} className={`animate-pulse text-white-force`} />
          <span className="text-white-force">{isOpen ? 'Tutup Asisten' : ' Tanya Buddy AI'}</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </motion.button>
      </div>

      {/* Main Glassmorphic Sliding Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="assistant-panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[94vw] sm:w-[450px] max-w-[480px] h-[75vh] max-h-[640px] border border-white/20 bg-slate-900/60 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)]"
          >
            {/* Header */}
            <header className="bg-white/95 text-slate-900 px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
                  <Bot size={18} className="text-white-force" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
                    Buddy AI Assistant
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mindful Sync Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSoundEffect('tick');
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Chat message space */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/95 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center shadow-sm text-xs ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {m.role === 'user' ? <User size={13} strokeWidth={2.5} className="text-white-force" /> : <Bot size={13} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-[12px] shadow-sm ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none font-normal'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-white-force leading-relaxed">{m.text}</p>
                    ) : (
                      <div className="space-y-1">{renderMessageText(m.text)}</div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 max-w-[80%] items-start">
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200 text-slate-400">
                    <Loader2 size={13} className="animate-spin" />
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Buddy sedang merenung</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Presets Section */}
            <div className="bg-slate-100/90 border-t border-slate-200/80 px-4 py-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] text-white uppercase tracking-widest mr-1">Rekomendasi Cepat:</span>
              <button
                onClick={() => handlePresetClick('finance')}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-slate-200 text-slate-705 hover:text-white border border-slate-200 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Lightbulb size={11} className="text-amber-500" /> Analisis Keuangan
              </button>
              <button
                onClick={() => handlePresetClick('quests')}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-slate-200 text-slate-705 hover:text-white border border-slate-200 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Zap size={11} className="text-indigo-500" /> Ide Quest Baru
              </button>
              <button
                onClick={() => handlePresetClick('motivation')}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-slate-200 text-slate-705 hover:text-white border border-slate-200 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Flame size={11} className="text-orange-500" /> Pompa Streak
              </button>
            </div>

            {/* Form Input Footer */}
            <footer className="bg-white px-4 py-3 border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanyakan analisis keuangan, ide quest harian..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 p-2.5 text-xs rounded-xl focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition"
              />
              <button
                onClick={() => sendMessageToSora(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/10"
              >
                <Send size={14} className="text-white-force" />
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

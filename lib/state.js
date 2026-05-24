// ==========================================
// DUMMY INITIAL STATES & PERSISTENCE HELPERS
// ==========================================

export const INITIAL_TASKS = [
  { id: 't1', text: 'Selesaikan Laporan Keuangan Semester 1', completed: true, difficulty: '★ HARD' },
  { id: 't2', text: 'Beli susu kotak & pakan kucing persia', completed: false, difficulty: '★ LIGHT' },
  { id: 't3', text: 'Push-up & Plank selama 15 menit', completed: false, difficulty: '★ MEDIUM' },
];

export const INITIAL_TRANSACTIONS = [
  { id: 'm1', text: 'Freelance Landing Page', amount: 1200000, type: 'income', category: 'Project' },
  { id: 'm2', text: 'Beli Kopi Susu Aren Gula Merah', amount: -28000, type: 'expense', category: 'Jajan' },
  { id: 'm3', text: 'Dana Darurat Bulanan Cair', amount: 500000, type: 'income', category: 'Saku' },
];

export const INITIAL_HABITS = [
  { id: 'h1', text: 'Membaca Buku 10 Hlmn', streak: 4, days: { Sen: true, Sel: true, Rab: false, Kam: true, Jum: true, Sab: false, Min: false } },
  { id: 'h2', text: 'Minum Air Putih 3 Liter', streak: 7, days: { Sen: true, Sel: true, Rab: true, Kam: true, Jum: true, Sab: true, Min: true } },
  { id: 'h3', text: 'Tidur Sebelum Jam 11 Malam', streak: 0, days: { Sen: false, Sel: false, Rab: false, Kam: false, Jum: false, Sab: false, Min: false } },
];

export const loadState = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

export const saveState = (key, state) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(state));
};

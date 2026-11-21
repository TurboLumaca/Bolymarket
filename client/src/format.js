export const percent = (p) => Math.round(p * 100) + '%';

export const credits = (n) =>
  Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// MySQL returns "YYYY-MM-DD HH:MM:SS"; the server and the browser share one time zone in this project.
export const toDate = (s) => new Date(s.replace(' ', 'T'));

export const dateTime = (s) =>
  toDate(s).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const day = (s) => toDate(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

export const statusLabel = {
  open: 'Aperto',
  closed: 'Chiuso',
  resolved: 'Risolto',
  voided: 'Annullato',
  proposed: 'In attesa',
  rejected: 'Rifiutato',
  hidden: 'Nascosto',
};

import { useEffect, useState } from 'react';
import { Clock, LogOut, TrendingDown, TrendingUp, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCashSession } from '../../../providers/CashSessionProvider';
import { getSessionHistory } from '../api/sessionApi';
import { usePermission } from '../../../shared/hooks/usePermission';
import CloseSessionModal from '../components/CloseSessionModal';
import type { CashSession } from '../types';

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('fr-FR');
}

export default function CashSessionPage() {
  const { session, loading, needsSession, open } = useCashSession();
  const { isOwner } = usePermission();
  const [showClose, setShowClose] = useState(false);
  const [history, setHistory] = useState<CashSession[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [balance, setBalance] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [histPage,   setHistPage] = useState(1);
  const HIST_PER_PAGE = 10;

  useEffect(() => {
    if (!isOwner) return;
    setHistLoading(true);
    getSessionHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [isOwner]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpening(true);
    try {
      await open(Number(balance) || 0);
      toast.success('Session ouverte !');
      setBalance('');
    } catch {
      toast.error("Erreur lors de l'ouverture.");
    } finally {
      setOpening(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Session de caisse</h1>
        <p className="text-xs text-gray-400 mt-1">Ouvrir et clôturer la session quotidienne</p>
      </div>

      {/* ── Statut session courante ─────────────────────────────────────── */}
      {needsSession && (
        <div className={`card border shadow-sm ${session ? 'bg-base-200 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="card-body py-5 px-5">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Session en cours</p>
                    <p className="text-lg font-bold text-emerald-600">Ouverte</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Depuis {new Date(session.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}par {session.opened_by_username}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Clock size={20} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-base-300 pt-3">
                  <span className="text-gray-500">Fond d'ouverture</span>
                  <span className="font-bold">{fmt(session.opening_balance)} F</span>
                </div>
                <button
                  onClick={() => setShowClose(true)}
                  className="btn btn-sm bg-gray-900 text-white hover:bg-gray-700 border-0 flex items-center gap-2 w-full"
                >
                  <LogOut size={14} /> Clôturer la session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock size={18} />
                  <p className="font-semibold text-sm">Aucune session ouverte</p>
                </div>
                <form onSubmit={handleOpen} className="flex flex-col gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Fond de caisse d'ouverture (F)</label>
                    <input
                      type="number" min={0}
                      placeholder="Ex: 5 000"
                      className="input input-bordered w-full"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Saisissez le montant en espèces présent dans la caisse.</p>
                  </div>
                  <button type="submit" disabled={opening}
                    className="btn bg-amber-500 hover:bg-amber-600 text-white border-0">
                    {opening ? <span className="loading loading-spinner loading-sm" /> : 'Ouvrir la session'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Historique (Propriétaire uniquement) ────────────────────────── */}
      {isOwner && (
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            {/* En-tête + filtre */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Historique des sessions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setHistPage(1); }}
                  className="input input-xs input-bordered w-36"
                />
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => { setFilterDate(''); setHistPage(1); }}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {histLoading ? (
              <div className="flex justify-center py-8"><span className="loading loading-spinner loading-md" /></div>
            ) : (() => {
              const filtered = history.filter((s) => {
                if (!filterDate) return true;
                const d = new Date(s.start_time).toISOString().slice(0, 10);
                return d === filterDate;
              });
              const totalPages = Math.ceil(filtered.length / HIST_PER_PAGE);
              const page = filtered.slice((histPage - 1) * HIST_PER_PAGE, histPage * HIST_PER_PAGE);

              return filtered.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">
                  {history.length === 0 ? 'Aucune session enregistrée.' : 'Aucune session pour cette période.'}
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="text-xs uppercase tracking-widest text-gray-400">
                          <th>Date</th>
                          <th>Employé</th>
                          <th className="text-right">Ouverture</th>
                          <th className="text-right">Attendu</th>
                          <th className="text-right">Compté</th>
                          <th className="text-right">Écart</th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.map((s) => {
                          const gap = s.gap;
                          return (
                            <tr key={s.id} className="hover:bg-base-300/40">
                              <td className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(s.start_time).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="text-sm font-medium">{s.opened_by_username}</td>
                              <td className="text-right text-sm">{fmt(s.opening_balance)}</td>
                              <td className="text-right text-sm">{s.expected_balance != null ? fmt(s.expected_balance) : '—'}</td>
                              <td className="text-right text-sm">{s.closing_balance != null ? fmt(s.closing_balance) : '—'}</td>
                              <td className={`text-right text-sm font-bold ${
                                gap === null || gap === undefined ? 'text-gray-300'
                                : gap >= 0 ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {gap !== null && gap !== undefined ? (
                                  <span className="flex items-center justify-end gap-1">
                                    {gap >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {gap >= 0 ? '+' : ''}{fmt(gap)}
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                      <p className="text-xs text-gray-400">
                        {filtered.length} session{filtered.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setHistPage(p => Math.max(1, p - 1))}
                          disabled={histPage === 1}
                          className="btn btn-xs btn-ghost disabled:opacity-30"
                        >
                          ‹
                        </button>
                        <span className="text-xs text-gray-500 px-2">
                          {histPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setHistPage(p => Math.min(totalPages, p + 1))}
                          disabled={histPage === totalPages}
                          className="btn btn-xs btn-ghost disabled:opacity-30"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showClose && (
        <CloseSessionModal
          onClose={() => setShowClose(false)}
          onClosed={() => setShowClose(false)}
        />
      )}
    </div>
  );
}
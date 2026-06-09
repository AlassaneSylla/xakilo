import { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCashSession } from '../../../providers/CashSessionProvider';
import type { CashSession } from '../types';

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('fr-FR');
}

type Props = {
  onClose: () => void;
  onClosed: (summary: CashSession) => void;
};

export default function CloseSessionModal({ onClose, onClosed }: Props) {
  const { session, close } = useCashSession();
  const [closing, setClosing]   = useState(false);
  const [balance, setBalance]   = useState('');
  const [summary, setSummary]   = useState<CashSession | null>(null);

  if (!session) return null;

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosing(true);
    try {
      const result = await close(Number(balance) || 0);
      setSummary(result);
      onClosed(result);
      toast.success('Session clôturée.');
    } catch {
      toast.error('Erreur lors de la clôture.');
    } finally {
      setClosing(false);
    }
  };

  const gap = summary?.gap;
  const gapPositive = gap !== null && gap !== undefined && gap >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-base-300">
          <h2 className="text-lg font-bold uppercase tracking-tight">Clôturer la session</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          {!summary ? (
            <form onSubmit={handleClose} className="flex flex-col gap-4">
              <div className="bg-base-200 rounded-xl p-4 space-y-1 text-sm">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Résumé session</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ouverture</span>
                  <span className="font-semibold">{fmt(session.opening_balance)} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ouvert par</span>
                  <span className="font-semibold">{session.opened_by_username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Depuis</span>
                  <span className="font-semibold">
                    {new Date(session.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">
                  Cash compté physiquement (F)
                </label>
                <input
                  type="number" min={0} required
                  placeholder="Ex: 45 000"
                  className="input input-bordered w-full"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Comptez le cash dans la caisse et saisissez le total exact.
                </p>
              </div>

              <button type="submit" disabled={closing}
                className="btn bg-gray-900 text-white hover:bg-gray-700 border-0 w-full">
                {closing
                  ? <span className="loading loading-spinner loading-sm" />
                  : 'Clôturer la session'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-base-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Résultat de clôture</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fond d'ouverture</span>
                  <span className="font-semibold">{fmt(summary.opening_balance)} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attendu (calculé)</span>
                  <span className="font-semibold">{fmt(summary.expected_balance)} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Compté physiquement</span>
                  <span className="font-semibold">{fmt(summary.closing_balance)} F</span>
                </div>
                <div className={`flex justify-between pt-2 border-t border-base-300 font-bold ${
                  gapPositive ? 'text-green-600' : 'text-red-500'
                }`}>
                  <span className="flex items-center gap-1">
                    {gapPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    Écart de caisse
                  </span>
                  <span>{gap !== null && gap !== undefined ? `${gap >= 0 ? '+' : ''}${fmt(gap)} F` : '—'}</span>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-sm btn-ghost w-full">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
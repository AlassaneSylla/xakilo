import { useState } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCashSession } from '../../../providers/CashSessionProvider';

export default function SessionBanner() {
  const { session, loading, needsSession, open } = useCashSession();
  const [opening, setOpening] = useState(false);
  const [balance, setBalance] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!needsSession || loading || session) return null;

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpening(true);
    try {
      await open(Number(balance) || 0);
      toast.success('Session ouverte !');
      setShowForm(false);
      setBalance('');
    } catch {
      toast.error("Erreur lors de l'ouverture de la session.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
          <AlertTriangle size={16} className="shrink-0" />
          Aucune session de caisse ouverte — les ventes, entrées et sorties sont bloquées.
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0 flex items-center gap-2"
          >
            <LogIn size={14} /> Ouvrir ma session
          </button>
        ) : (
          <form onSubmit={handleOpen} className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Fond de caisse (F)"
              className="input input-sm input-bordered w-48"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <button
              type="submit"
              disabled={opening}
              className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0"
            >
              {opening ? <span className="loading loading-spinner loading-xs" /> : 'Confirmer'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-sm btn-ghost text-amber-600"
            >
              Annuler
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
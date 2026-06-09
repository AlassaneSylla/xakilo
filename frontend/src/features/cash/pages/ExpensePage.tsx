import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { addExpense, listExpenses } from '../api/sessionApi';
import { useCashSession } from '../../../providers/CashSessionProvider';
import type { Expense, ExpensePayload } from '../types';

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

const EMPTY: ExpensePayload = { amount: 0, description: '', payment_mode: 'especes' };

export default function ExpensePage() {
  const { session, needsSession } = useCashSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm]         = useState<ExpensePayload>({ ...EMPTY });
  const [loading, setLoading]   = useState(false);

  const blocked = needsSession && !session;

  useEffect(() => {
    listExpenses().then(setExpenses).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) {
      toast.error('Montant et description sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const created = await addExpense(form);
      setExpenses((p) => [created, ...p]);
      setForm({ ...EMPTY });
      toast.success('Dépense enregistrée.');
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Dépenses</h1>
        <p className="text-xs text-gray-400 mt-1">Déclarer les petites dépenses de la journée</p>
      </div>

      {blocked && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          Ouvrez une session de caisse pour déclarer des dépenses.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Formulaire ─────────────────────────────────── */}
        <div className="lg:col-span-2 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Nouvelle dépense</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text" placeholder="Description (ex: Emballages, Transport…)"
                className="input input-bordered w-full" required
                disabled={blocked}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <input
                type="number" min={1} placeholder="Montant (F)"
                className="input input-bordered w-full" required
                disabled={blocked}
                value={form.amount || ''}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
              />
              <select
                className="select select-bordered w-full"
                disabled={blocked}
                value={form.payment_mode}
                onChange={(e) => setForm((p) => ({ ...p, payment_mode: e.target.value as ExpensePayload['payment_mode'] }))}
              >
                <option value="especes">Espèces</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
              <button
                type="submit" disabled={loading || blocked}
                className="btn bg-gray-900 text-white hover:bg-gray-700 border-0 flex items-center gap-2 w-full"
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <><PlusCircle size={16} /> Enregistrer</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── Tableau ────────────────────────────────────── */}
        <div className="lg:col-span-3 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Dépenses enregistrées
              </p>
              {expenses.length > 0 && (
                <span className="text-xs text-gray-400">
                  {expenses.length} dépense{expenses.length > 1 ? 's' : ''} ·{' '}
                  <span className="font-bold text-red-500">
                    −{fmt(expenses.reduce((s, e) => s + e.amount, 0))} F
                  </span>
                </span>
              )}
            </div>
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10">Aucune dépense enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-gray-400">
                      <th>Date</th>
                      <th>Description</th>
                      <th>Mode</th>
                      <th className="text-right">Montant</th>
                      <th>Par</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((ex) => (
                      <tr key={ex.id} className="hover:bg-base-300/40">
                        <td className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(ex.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="text-sm">{ex.description}</td>
                        <td className="text-xs">
                          <span className={`badge badge-sm ${ex.payment_mode === 'especes' ? 'badge-warning' : 'badge-info'}`}>
                            {ex.payment_mode === 'especes' ? 'Espèces' : 'Mobile'}
                          </span>
                        </td>
                        <td className="text-right text-sm font-bold text-red-500">−{fmt(ex.amount)}</td>
                        <td className="text-xs text-gray-400">{ex.declared_by_username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
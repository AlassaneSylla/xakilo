import { useState } from 'react';
import { Banknote, Smartphone, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { client } from '../../../shared/api/client';
import Button from '../../../shared/components/ui/Button';
import { useCashSession } from '../../../providers/CashSessionProvider';
import type { Removal, PaymentMode } from '../../stock/removals/types';

const MODE_OPTIONS: { value: PaymentMode; label: string; icon: React.ReactNode }[] = [
  { value: 'especes',      label: 'Espèces',       icon: <Banknote   size={16} /> },
  { value: 'mobile_money', label: 'Mobile Money',  icon: <Smartphone size={16} /> },
  { value: 'carte',        label: 'Carte',         icon: <CreditCard size={16} /> },
];

type Props = {
  removal: Removal | null;
  onClose: () => void;
  onSuccess: (updated: Removal) => void;
};

export default function PaymentModal({ removal, onClose, onSuccess }: Props) {
  const { ensureSession } = useCashSession();
  const [amount,  setAmount]  = useState('');
  const [mode,    setMode]    = useState<PaymentMode>('especes');
  const [note,    setNote]    = useState('');
  const [saving,  setSaving]  = useState(false);

  if (!removal) return null;

  const balance     = removal.balance_due ?? (removal.invoice?.total_amount ?? 0) - (removal.amount_paid ?? 0);
  const isFullPay   = Number(amount) >= balance;

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!Number(amount) || Number(amount) <= 0) {
      toast.error('Montant invalide');
      return;
    }
    const ok = await ensureSession();
    if (!ok) return;
    setSaving(true);
    try {
      const { data: updated } = await client.post<Removal>(
        `removals/${removal.id}/payments/add/`,
        { amount: Number(amount), mode, note: note || null },
      );
      toast.success(isFullPay ? 'Facture soldée ✓' : 'Paiement partiel enregistré');
      onSuccess(updated);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-bold text-lg">Encaisser un paiement</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {removal.invoice?.invoice_number ?? removal.removal_ref} — {removal.client_name || 'Client comptoir'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            <X size={14} />
          </button>
        </div>

        {/* Résumé facture */}
        <div className="bg-base-200 rounded-lg p-3 mb-5 text-sm grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-400">Total facture</p>
            <p className="font-bold">{(removal.invoice?.total_amount ?? 0).toLocaleString('fr-FR')} F</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Déjà encaissé</p>
            <p className="font-bold text-green-600">{(removal.amount_paid ?? 0).toLocaleString('fr-FR')} F</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Reste à payer</p>
            <p className="font-bold text-orange-500">{balance.toLocaleString('fr-FR')} F</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode de paiement */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                    mode === m.value
                      ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                      : 'bg-base-200 border-base-300 text-gray-600 hover:bg-base-300'
                  }`}
                >
                  {m.icon}
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Montant encaissé (F) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input flex-1"
                placeholder="0"
                min={1}
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline btn-sm h-10 text-xs"
                onClick={() => setAmount(String(balance))}
              >
                Tout ({balance.toLocaleString('fr-FR')})
              </button>
            </div>
            {amount && Number(amount) > 0 && (
              <p className={`text-xs mt-1 font-medium ${isFullPay ? 'text-green-600' : 'text-orange-500'}`}>
                {isFullPay
                  ? '✓ Facture soldée intégralement'
                  : `Reste ${(balance - Number(amount)).toLocaleString('fr-FR')} F après ce versement`}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Note (optionnel)
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Ex: Acompte reçu le..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal-action pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <Button variant="dark" size="md" type="submit" loading={saving}>
              Enregistrer le paiement
            </Button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
import { useEffect, useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { client } from '../../../shared/api/client';
import Button from '../../../shared/components/ui/Button';
import ProductCombobox from '../../../shared/components/ui/ProductCombobox';
import { useCashSession } from '../../../providers/CashSessionProvider';
import type { Product } from '../../products/types';
import type { Removal } from '../../stock/removals/types';

type LineItem = { product_id: number; product_name: string; quantity: number; unit_price: number };
type PaymentMode = 'especes' | 'mobile_money' | 'carte';

type Props = { onSuccess?: (created: Removal) => void };

function computeStatus(paid: number, total: number) {
  if (total > 0 && paid >= total) return { key: 'payee',              label: 'Payée',               color: 'badge-success' };
  if (paid > 0)                   return { key: 'partiellement_payee', label: 'Partiellement payée', color: 'badge-warning' };
  return                                  { key: 'en_attente',         label: 'En attente',          color: 'badge-ghost'   };
}
export default function QuickSaleModal({ onSuccess }: Props) {
  const { ensureSession } = useCashSession();

  const [products, setProducts]       = useState<Product[]>([]);
  const [clientName, setClientName]   = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [lines, setLines]             = useState<LineItem[]>([]);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('especes');
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    client.get<Product[]>('products/').then(({ data }) => setProducts(data)).catch(() => {
      toast.error('Impossible de charger la liste des produits');
    });
  }, []);

  const addLine = () => {
    if (!products.length) return;
    const p = products[0];
    setLines((prev) => [
      ...prev,
      { product_id: p.id, product_name: p.product_name, quantity: 1, unit_price: p.unit_price ?? 0 },
    ]);
  };

  const updateLineProduct = (idx: number, p: Product) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], product_id: p.id, product_name: p.product_name, unit_price: p.unit_price ?? 0 };
      return next;
    });
  };

  const updateLineQty = (idx: number, qty: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: qty };
      return next;
    });
  };

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const total  = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const status = computeStatus(initialPayment, total);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!lines.length) { toast.error('Ajoutez au moins un produit'); return; }

    const ok = await ensureSession();
    if (!ok) return;

    setSaving(true);
    try {
      const { data: created } = await client.post<Removal>('removals/add/', {
        client_name:     clientName || 'Client comptoir',
        client_phone:    clientPhone || undefined,
        destination:     'vente',
        invoice_status:  status.key,
        items:           lines.map((l) => ({ product: l.product_id, quantity: l.quantity })),
        initial_payment: initialPayment,
        payment_mode:    paymentMode,
      });
      toast.success('Vente enregistrée');
      setLines([]);
      setClientName('');
      setClientPhone('');
      setInitialPayment(0);
      setPaymentMode('especes');
      (document.getElementById('quick_sale_modal') as HTMLDialogElement)?.close();
      onSuccess?.(created);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? 'Erreur lors de la vente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog id="quick_sale_modal" className="modal">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-(--primary)" />
          <h3 className="font-bold text-lg">Vente Rapide</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</label>
              <input
                className="input w-full mt-1"
                placeholder="Nom du client (facultatif)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="w-40">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tél. (opt.)</label>
              <input
                className="input w-full mt-1"
                placeholder="77 000 00 00"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Produits */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Produits</label>
              <button type="button" onClick={addLine}
                className="btn btn-xs btn-ghost text-(--primary) flex items-center gap-1">
                <Plus size={12} /> Ajouter ligne
              </button>
            </div>

            {lines.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4 border border-dashed border-base-300 rounded-lg">
                Cliquez sur "Ajouter ligne" pour commencer
              </p>
            )}

            {/* En-têtes colonnes */}
            {lines.length > 0 && (
              <div className="grid grid-cols-12 gap-2 mb-1 px-1">
                <span className="col-span-5 text-xs text-gray-400 uppercase tracking-wide">Produit</span>
                <span className="col-span-2 text-xs text-gray-400 uppercase tracking-wide text-center">Qté</span>
                <span className="col-span-4 text-xs text-gray-400 uppercase tracking-wide text-right">Sous-total</span>
              </div>
            )}

            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <ProductCombobox
                    products={products}
                    value={line}
                    onChange={(p) => updateLineProduct(idx, p)}
                    className="col-span-5"
                  />
                  <input
                    type="number" min={1}
                    className="input input-sm col-span-2 text-center"
                    value={line.quantity}
                    onChange={(e) => updateLineQty(idx, Number(e.target.value))}
                  />
                  <div className="col-span-4 text-sm text-right pr-1 text-gray-600">
                    {(line.quantity * line.unit_price).toLocaleString('fr-FR')} F
                  </div>
                  <button type="button" onClick={() => removeLine(idx)}
                    className="btn btn-ghost btn-xs col-span-1 text-red-400 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {lines.length > 0 && (
              <div className="flex justify-end mt-3 font-bold text-base">
                Total : {total.toLocaleString('fr-FR')} F
              </div>
            )}
          </div>

          {/* ── Bloc encaissement ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 p-4 bg-base-200 border border-base-300 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Encaissement</p>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Montant versé (F)</label>
                <input
                  type="number" min={0}
                  placeholder="0"
                  className="input input-bordered input-sm w-full"
                  value={initialPayment || ''}
                  onChange={(e) => setInitialPayment(Number(e.target.value))}
                />
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Mode</label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                >
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte">Carte</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-base-300 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 text-xs">Statut :</span>
                <span className={`badge badge-sm ${status.color}`}>{status.label}</span>
              </div>
              {initialPayment > total && total > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  Monnaie à rendre : {(initialPayment - total).toLocaleString('fr-FR')} F
                </span>
              )}
              {initialPayment > 0 && initialPayment < total && (
                <span className="text-xs text-orange-500 font-semibold">
                  Reste dû : {(total - initialPayment).toLocaleString('fr-FR')} F
                </span>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost"
              onClick={() => (document.getElementById('quick_sale_modal') as HTMLDialogElement)?.close()}>
              Annuler
            </button>
            <Button variant="primary" size="md" type="submit" loading={saving}>
              <Zap size={14} /> Valider la vente
            </Button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

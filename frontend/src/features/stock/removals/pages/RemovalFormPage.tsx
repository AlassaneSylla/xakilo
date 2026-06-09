import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircleX, Plus, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useRemovals } from '../hooks/useRemovals';
import { getProducts } from '../../../products/api/productApi';
import Button from '../../../../shared/components/ui/Button';
import { PATHS } from '../../../../router/paths';
import { useCashSession } from '../../../../providers/CashSessionProvider';
import type { Product } from '../../../products/types';
import type { RemovalPayload } from '../types';

const EMPTY_FORM: RemovalPayload = {
  client_name:     '',
  client_phone:    '',
  destination:     'vente',
  invoice_status:  'en_attente',
  items:           [],
  justification:   '',
  proof_image:     null,
  initial_payment: 0,
  payment_mode:    'especes',
};

function computeStatus(paid: number, total: number): {
  key: string; label: string; color: string;
} {
  if (total > 0 && paid >= total) return { key: 'payee',             label: 'Payée',               color: 'badge-success' };
  if (paid > 0)                   return { key: 'partiellement_payee', label: 'Partiellement payée', color: 'badge-warning' };
  return                                  { key: 'en_attente',        label: 'En attente',          color: 'badge-ghost'   };
}

export default function RemovalFormPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prefill   = (location.state ?? {}) as { prefillProductId?: number };
  const { create } = useRemovals();
  const { ensureSession } = useCashSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm]         = useState<RemovalPayload>({ ...EMPTY_FORM });
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState<string | null>(null);
  const fileInputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProducts().then((prods) => {
      setProducts(prods);
      if (prefill.prefillProductId) {
        setForm((p) => ({
          ...p,
          items: [{ product: prefill.prefillProductId!, quantity: 1 }],
        }));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Total estimé à partir des items sélectionnés ──────────────────────
  const estimatedTotal = form.items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.product);
    return sum + (prod?.unit_price ?? 0) * item.quantity;
  }, 0);

  const paid   = form.initial_payment ?? 0;
  const status = computeStatus(paid, estimatedTotal);

  // ── Handlers ─────────────────────────────────────────────────────────
  const addItem = () =>
    setForm((p) => ({ ...p, items: [...p.items, { product: products[0]?.id ?? 0, quantity: 1 }] }));

  const updateItem = (index: number, field: 'product' | 'quantity', value: number) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm((p) => ({ ...p, items }));
  };

  const removeItem = (index: number) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== index) }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, proof_image: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const removeImage = () => {
    setForm((p) => ({ ...p, proof_image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.items.length === 0) {
      toast.error('Veuillez ajouter au moins un produit.');
      return;
    }

    if (form.destination === 'perte' && !form.justification?.trim()) {
      toast.error('Le justificatif est obligatoire pour une perte.');
      return;
    }

    const ok = await ensureSession();
    if (!ok) return;

    setLoading(true);
    try {
      await create({ ...form, invoice_status: status.key });
      toast.success('Sortie enregistrée !');
      setForm({ ...EMPTY_FORM });
      setPreview(null);
      setTimeout(() => navigate(PATHS.REMOVALS), 800);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const isVente = form.destination === 'vente';
  const isPerte = form.destination === 'perte';

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Créer une sortie</h1>
      <div className="p-1 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Client — masqué pour les pertes */}
          {!isPerte && (
            <>
              <input
                type="text"
                placeholder={isVente ? 'Prénom et nom du client ou raison sociale' : 'Nom du destinataire (optionnel)'}
                className="input input-neutral w-full"
                required={isVente}
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
              />
              {isVente && (
                <input
                  type="tel" placeholder="Téléphone client (optionnel — WhatsApp)"
                  className="input input-neutral w-full"
                  value={form.client_phone ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, client_phone: e.target.value }))}
                />
              )}
            </>
          )}

          {/* Produits */}
          <div>
            {form.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <select className="select select-bordered flex-1" value={item.product}
                  onChange={(e) => updateItem(i, 'product', Number(e.target.value))}>
                  <option value="">Sélectionner un produit</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.product_name}</option>
                  ))}
                </select>
                <input type="number" className="input input-neutral w-24" min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                <CircleX className="text-red-500 cursor-pointer" onClick={() => removeItem(i)} />
              </div>
            ))}
            <button type="button"
              className="btn btn-xs hover:text-[color:var(--brokenWhite)] hover:bg-[color:var(--black)]"
              onClick={addItem}>
              <Plus className="text-[var(--primary)]" /> Ajouter produit
            </button>
          </div>

          {/* Destination */}
          <div>
            <label className="font-semibold">Destination</label>
            <select className="select select-bordered w-full" value={form.destination}
              onChange={(e) => setForm((p) => ({
                ...p,
                destination:     e.target.value,
                client_name:     e.target.value === 'perte' ? '' : p.client_name,
                client_phone:    e.target.value === 'perte' ? '' : p.client_phone,
                justification:   '',
                proof_image:     null,
                initial_payment: 0,
              }))}>
              <option value="vente">Vente</option>
              <option value="don">Don</option>
              <option value="perte">Perte</option>
            </select>
          </div>

          {/* ── Bloc encaissement (vente uniquement) ──────────────────────── */}
          {isVente && (
            <div className="flex flex-col gap-3 p-4 bg-base-200 border border-base-300 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Encaissement
              </p>

              {/* Total estimé */}
              {estimatedTotal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total facture estimé</span>
                  <span className="font-bold">{estimatedTotal.toLocaleString('fr-FR')} F</span>
                </div>
              )}

              {/* Montant versé */}
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Montant versé par le client (F)
                </label>
                <input
                  type="number" min={0}
                  placeholder="0"
                  className="input input-bordered w-full"
                  value={form.initial_payment || ''}
                  onChange={(e) => setForm((p) => ({ ...p, initial_payment: Number(e.target.value) }))}
                />
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="text-sm font-semibold block mb-1">Mode de paiement</label>
                <select
                  className="select select-bordered w-full"
                  value={form.payment_mode}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    payment_mode: e.target.value as RemovalPayload['payment_mode'],
                  }))}>
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>

              {/* Statut calculé + monnaie à rendre */}
              <div className="flex items-center justify-between pt-1 border-t border-base-300">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Statut :</span>
                  <span className={`badge badge-sm ${status.color}`}>{status.label}</span>
                </div>
                {paid > estimatedTotal && estimatedTotal > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">
                    Monnaie à rendre : {(paid - estimatedTotal).toLocaleString('fr-FR')} F
                  </span>
                )}
                {paid > 0 && paid < estimatedTotal && (
                  <span className="text-xs text-orange-500 font-semibold">
                    Reste dû : {(estimatedTotal - paid).toLocaleString('fr-FR')} F
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Justificatif perte ────────────────────────────────────────── */}
          {isPerte && (
            <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                Justificatif de perte (obligatoire)
              </p>
              <textarea
                className="textarea textarea-bordered w-full min-h-[90px]"
                placeholder="Décrivez le motif de la perte (produit gâté, cassé, vol, périmé…)"
                required={isPerte}
                value={form.justification ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, justification: e.target.value }))}
              />
              <div>
                <p className="text-xs text-gray-500 mb-2">Photo preuve (optionnelle)</p>
                {preview ? (
                  <div className="relative inline-block">
                    <img src={preview} alt="Preuve"
                      className="h-32 w-32 object-cover rounded-lg border border-red-200" />
                    <button type="button" onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 btn btn-sm btn-outline border-dashed border-red-300 text-red-400 hover:bg-red-50">
                    <ImagePlus size={16} /> Ajouter une photo
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                  className="hidden" onChange={handleImageChange} />
              </div>
            </div>
          )}

          <Button variant="primary" size="md" type="submit" disabled={loading}>
            {loading
              ? <span className="loading loading-spinner loading-sm text-[var(--primary)]" />
              : 'Enregistrer'}
          </Button>
        </form>
      </div>
    </div>
  );
}
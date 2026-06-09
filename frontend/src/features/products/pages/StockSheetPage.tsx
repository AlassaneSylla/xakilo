import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Download, Minus, Plus, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { client } from '../../../shared/api/client';
import type { Product } from '../types';
import type { Entry } from '../../stock/entries/types';
import type { Removal } from '../../stock/removals/types';
import Button from '../../../shared/components/ui/Button';
import Modal, { type ModalHandle } from '../../../shared/components/ui/Modal';
import Pagination from '../../../shared/components/ui/Pagination';
import { useStockAlert } from '../../../providers/StockAlertProvider';
import { PATHS } from '../../../router/paths';

type Movement = {
  date: string;
  quantity: number;
  type: 'entry' | 'removal';
  label?: string;   // fournisseur ou client
  destination?: string;
};

type StockPoint = { updateDate: string; quantity: number };

export default function StockSheetPage() {
  const { product } = (useLocation().state ?? {}) as { product: Product };
  const navigate    = useNavigate();
  const { refreshLowStock } = useStockAlert();

  const addEntryRef = useRef<ModalHandle>(null);
  const [entryQty,       setEntryQty]       = useState(1);
  const [entrySupplier,  setEntrySupplier]  = useState('');
  const [entrySaving,    setEntrySaving]    = useState(false);

  const [movements,     setMovements]      = useState<Movement[]>([]);
  const [stockVariation, setStockVariation] = useState<StockPoint[]>([]);
  const [currentPage,   setCurrentPage]    = useState(1);

  const loadMovements = () => {
    if (!product?.id) return;
    Promise.all([
      client.get(`entries/product/${product.id}/`),
      client.get(`removals/product/${product.id}/`),
    ]).then(([entries, removals]) => {
      const entryPoints: Movement[] = (entries.data as Entry[]).map((e) => ({
        date:     e.date_register,
        quantity: e.quantity,
        type:     'entry',
        label:    e.supplier ?? '—',
      }));

      const removalPoints: Movement[] = (removals.data as Removal[]).flatMap((r) => {
        const date = r.date_register ?? r.invoice?.date_created ?? '';
        const items = r.invoice?.products ?? [];
        if (items.length) {
          return items.map((p) => ({
            date,
            quantity:    p.quantity,
            type:        'removal',
            label:       r.client_name || '—',
            destination: r.destination,
          }));
        }
        return [{
          date,
          quantity:    1,
          type:        'removal',
          label:       r.client_name || '—',
          destination: r.destination,
        }];
      });

      const all = [...entryPoints, ...removalPoints]
        .filter((m) => m.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let stock = 0;
      const variation: StockPoint[] = all.map((m) => {
        stock += m.type === 'entry' ? m.quantity : -m.quantity;
        return { updateDate: new Date(m.date).toISOString().split('T')[0], quantity: stock };
      });

      setMovements(all);
      setStockVariation(variation);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMovements(); }, [product]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setEntrySaving(true);
    try {
      await client.post('entries/add/', {
        product:  product.id,
        quantity: entryQty,
        supplier: entrySupplier || null,
        category: product.category,
      });
      toast.success('Entrée ajoutée !');
      setEntryQty(1);
      setEntrySupplier('');
      addEntryRef.current?.close();
      loadMovements();
      refreshLowStock();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? "Erreur lors de l'ajout");
    } finally {
      setEntrySaving(false);
    }
  };

  const handleGoToRemovalForm = () => {
    navigate(PATHS.REMOVAL_FORM, {
      state: { prefillProductId: product?.id, prefillProductName: product?.product_name },
    });
  };

  const handleExportPDF = () => window.print();

  const PER_PAGE    = 5;
  const total       = Math.ceil(movements.length / PER_PAGE);
  const currentItems = movements.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const DEST_LABELS: Record<string, string> = { vente: 'Vente', don: 'Don', perte: 'Perte' };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          /* Supprimer toutes les contraintes de hauteur et overflow du Layout */
          html, body { overflow: visible !important; height: auto !important; width: 100% !important; }
          [class*="h-screen"]   { height: auto !important; }
          [class*="h-full"]     { height: auto !important; }
          [class*="overflow-hidden"] { overflow: visible !important; }
          [class*="overflow-y-auto"] { overflow: visible !important; }
          [class*="grid-rows"]  { display: block !important; }
          [class*="shrink-0"]   { display: none !important; }
          header, footer, aside, nav { display: none !important; }
          main { display: block !important; overflow: visible !important; height: auto !important; padding: 0 !important; }
        }
      `}</style>

      <div>
        <h1 className="text-2xl font-bold uppercase no-print">
          Fiche de stock — {product?.product_ref}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Infos produit */}
          <div className="card bg-base-300 shadow-md">
            <div className="card-body">
              <h2 className="text-xl font-bold">Infos Produit</h2>
              {product ? (
                <ul className="space-y-2 text-sm">
                  <li>🏷️ Libellé : <span className="font-bold capitalize">{product.product_name}</span></li>
                  <li>📂 Catégorie : <span className="font-bold capitalize">{product.category}</span></li>
                  <li>📦 Stock actuel : <span className="font-bold">{product.stock}</span></li>
                  <li>💰 Prix de vente : <span className="font-bold">{product.unit_price} F</span></li>
                  <li>💵 Prix d'achat : <span className="font-bold">{product.purchase_price} F</span></li>
                  <li>⚠️ Seuil d'alerte : <span className="font-bold">{product.alert}</span></li>
                </ul>
              ) : <p>Aucun produit sélectionné.</p>}
              {product?.stock <= product?.alert && (
                <p className="text-red-500 mt-4 text-sm font-semibold">
                  🚨 Stock faible — réapprovisionnement recommandé
                </p>
              )}
            </div>
          </div>

          {/* Graphique */}
          <div>
            <h2 className="text-xl font-bold mb-2">📈 Évolution du stock</h2>
            {stockVariation.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stockVariation}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="updateDate" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={35} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quantity" stroke="var(--primary)" name="Stock" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* ── 3 boutons d'action ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8 no-print">
          <Button variant="primary" size="md" onClick={() => addEntryRef.current?.open()}>
            <Plus size={15} /> Ajouter entrée
          </Button>
          <Button variant="redghost" size="md" onClick={handleGoToRemovalForm}>
            <Minus size={15} /> Enregistrer sortie
          </Button>
          <Button variant="greyghost" size="md" onClick={handleExportPDF}>
            <Download size={15} /> Générer rapport PDF
          </Button>
        </div>

        {/* ── Historique des mouvements ──────────────────────── */}
        <h2 className="text-xl font-bold mb-3">Historique des mouvements</h2>
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Type</th><th>Date</th><th>Quantité</th><th>Fournisseur / Client</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((item, i) => (
              <tr key={i} className="hover:bg-base-200">
                <td>
                  {item.type === 'entry' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                      <ArrowDownToLine size={14} /> Entrée
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500 font-medium text-sm">
                      <ArrowUpFromLine size={14} />
                      {DEST_LABELS[item.destination ?? ''] ?? 'Sortie'}
                    </span>
                  )}
                </td>
                <td className="text-sm">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                <td className="font-bold">{item.quantity}</td>
                <td className="text-sm text-gray-500">{item.label ?? '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center text-gray-500 py-6">Aucun mouvement enregistré.</td></tr>
            )}
          </tbody>
        </table>

        <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />

        {/* ── Modal ajout entrée ─────────────────────────────── */}
        <Modal ref={addEntryRef} title={`Ajouter une entrée — ${product?.product_name ?? ''}`}>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Quantité *
              </label>
              <input
                type="number"
                min={1}
                className="input w-full"
                value={entryQty}
                onChange={(e) => setEntryQty(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Fournisseur
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Nom du fournisseur (optionnel)"
                value={entrySupplier}
                onChange={(e) => setEntrySupplier(e.target.value)}
              />
            </div>
            <div className="modal-action pt-2">
              <button type="button" className="btn btn-ghost" onClick={() => addEntryRef.current?.close()}>
                Annuler
              </button>
              <Button variant="primary" size="md" type="submit" loading={entrySaving}>
                <Plus size={14} /> Ajouter
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
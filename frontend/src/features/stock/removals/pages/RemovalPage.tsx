import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Minus, ReceiptText, Ban, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useRemovals } from '../hooks/useRemovals';
import { cancelRemoval } from '../api/removalsApi';
import InvoiceTemplate from '../../../invoices/components/InvoiceTemplate';
import Button from '../../../../shared/components/ui/Button';
import IconButton from '../../../../shared/components/ui/IconButton';
import Pagination from '../../../../shared/components/ui/Pagination';
import DateRangeFilter from '../../../../shared/components/ui/DateRangeFilter';
import { usePermission } from '../../../../shared/hooks/usePermission';
import { PATHS } from '../../../../router/paths';
import type { Removal } from '../types';

const PAGE_SIZE = 20;

const DEST_LABELS: Record<string, string> = { vente: 'Vente', don: 'Don', perte: 'Perte' };
const DEST_COLORS: Record<string, string> = {
  vente: 'text-emerald-600',
  don:   'text-blue-500',
  perte: 'text-red-500',
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RemovalPage() {
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter,      setDateFilter]      = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { removals, count, loading, refetch } = useRemovals(currentPage, debouncedSearch, dateFilter);
  const { canCancelRemoval, isSuperUser, isOwner } = usePermission();
  const [selectedInvoice, setSelectedInvoice] = useState<Removal | null>(null);

  // ── état modale annulation ──────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<Removal | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling,   setCancelling]   = useState(false);

  // ── état mini-modale détails ────────────────────────────────────────────
  const [detailTarget, setDetailTarget] = useState<Removal | null>(null);

  const total = Math.ceil(count / PAGE_SIZE);

  const handleShowInvoice = (removal: Removal) => {
    setSelectedInvoice(removal);
    (document.getElementById('invoice_modal') as HTMLDialogElement)?.showModal();
  };

  const handleOpenCancel = (removal: Removal) => {
    setCancelTarget(removal);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelRemoval(cancelTarget.id, cancelReason);
      toast.success('Sortie annulée — stock et finance mis à jour');
      refetch();
      setCancelTarget(null);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Table des Sorties</h1>

      <div className="grid grid-cols-3 gap-6 mb-8 mt-4 items-center">
        <label className="input">
          <Search size={16} />
          <input type="search" placeholder="Rechercher par client, référence, destination"
            value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </label>
        <Link to={PATHS.REMOVAL_FORM} className="block w-full">
          <Button variant="primary" size="md" className="w-full">
            <Minus /> Enregistrer une sortie
          </Button>
        </Link>
        <DateRangeFilter value={dateFilter} onChange={(d) => { setDateFilter(d); setCurrentPage(1); }} />
      </div>

      {(search || dateFilter) && (
        <p className="text-xs text-gray-400 mb-3">{count} résultat(s)</p>
      )}

      <div>
        <table className="table table-fixed w-full text-sm">
          <colgroup>
            <col className="w-32" />
            <col className="w-28" />
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-32" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="bg-base-200 text-xs uppercase tracking-wide text-gray-500">
              <th>Référence</th>
              <th>Client</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {removals.map((row) => {
              const isSale         = row.destination === 'vente';
              const isCancelled    = row.invoice_status === 'annulee';
              const age            = daysSince(row.date_register);
              const isTooOld       = age > 7;   // personne ne peut annuler
              const isOwnerOnly    = age > 2 && age <= 7; // OWNER seulement
              const canCancel      = canCancelRemoval || isSuperUser;
              const canForceCancel = isOwner || isSuperUser;

              return (
                <tr key={row.id} className={`hover:bg-base-200 ${isCancelled ? 'opacity-50' : ''}`}>
                  <td className={`font-mono text-xs truncate ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                    {isSale ? (row.invoice?.invoice_number ?? '—') : (row.removal_ref ?? '—')}
                  </td>
                  <td className="truncate text-xs">{row.client_name || '—'}</td>
                  <td>
                    <span className={`text-xs font-semibold ${isCancelled ? 'text-gray-400' : (DEST_COLORS[row.destination] ?? '')}`}>
                      {DEST_LABELS[row.destination] ?? row.destination}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500">
                    {row.date_register
                      ? new Date(row.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
                      : '—'}
                  </td>
                  <td className="text-xs font-semibold">
                    {isSale ? `${row.invoice?.total_amount?.toLocaleString('fr-FR')} F` : '—'}
                  </td>
                  <td>
                    {isCancelled ? (
                      <button
                        className="badge badge-error badge-xs cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setDetailTarget(row)}
                        title="Voir les détails d'annulation"
                      >
                        Annulée
                      </button>
                    ) : isSale ? (
                      <span className={`badge badge-xs ${row.invoice?.status === 'payee' ? 'badge-success' : 'badge-warning'}`}>
                        {row.invoice?.status === 'payee' ? 'Payée' : 'Attente'}
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-xs">—</span>
                    )}
                  </td>
                  <td className="text-xs capitalize truncate text-gray-500">{row.created_by_username}</td>
                  <td>
                    <div className="flex gap-1 items-center">
                      {canCancel && !isCancelled && (
                        isTooOld ? (
                          <div className="tooltip tooltip-left" data-tip="Plus de 7 jours — créer un bon de retour">
                            <button className="btn btn-xs btn-ghost text-gray-300 cursor-default">
                              <Info size={13} />
                            </button>
                          </div>
                        ) : isOwnerOnly && !canForceCancel ? (
                          <div className="tooltip tooltip-left" data-tip="Plus de 2 jours — contacter le propriétaire">
                            <button className="btn btn-xs btn-ghost text-gray-300 cursor-default">
                              <Info size={13} />
                            </button>
                          </div>
                        ) : (
                          <IconButton tooltip="Annuler cette sortie" color="danger" onClick={() => handleOpenCancel(row)}>
                            <Ban size={13} />
                          </IconButton>
                        )
                      )}
                      {!isCancelled && (
                        <IconButton
                          tooltip={isSale ? 'Afficher facture' : 'Afficher bon de sortie'}
                          color="warning"
                          onClick={() => handleShowInvoice(row)}
                        >
                          <ReceiptText size={13} />
                        </IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {removals.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8">Aucune sortie trouvée.</td></tr>
            )}
          </tbody>
        </table>
        <InvoiceTemplate selectedInvoice={selectedInvoice} />
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />

      {/* ── Modale confirmation annulation ───────────────────────────────── */}
      {cancelTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Ban size={16} className="text-red-500" />
                Annuler cette sortie ?
              </h3>
              <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setCancelTarget(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="bg-base-200 rounded-lg px-4 py-3 text-sm mb-4 space-y-1">
              <p><span className="text-gray-500">Référence :</span> <span className="font-mono font-semibold">{cancelTarget.removal_ref}</span></p>
              {cancelTarget.client_name && (
                <p><span className="text-gray-500">Client :</span> {cancelTarget.client_name}</p>
              )}
              <p><span className="text-gray-500">Date :</span> {new Date(cancelTarget.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              {cancelTarget.invoice?.total_amount && (
                <p><span className="text-gray-500">Montant :</span> <span className="font-semibold text-red-500">{cancelTarget.invoice.total_amount.toLocaleString('fr-FR')} F</span></p>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Le stock des produits sera <strong>restauré automatiquement</strong>. Cette action est <strong>irréversible</strong>.
            </p>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Motif d'annulation <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full mt-1 text-sm"
                rows={3}
                placeholder="Ex: Retour client, erreur de saisie…"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setCancelTarget(null)}>
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm text-white"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? <span className="loading loading-spinner loading-xs" /> : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setCancelTarget(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* ── Mini-modale détails annulation ───────────────────────────────── */}
      {detailTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
                <Ban size={15} /> Détails de l'annulation
              </h3>
              <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setDetailTarget(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Référence</span>
                <span className="font-mono font-semibold">{detailTarget.removal_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Annulée le</span>
                <span className="font-medium">
                  {detailTarget.cancelled_at ? fmtDateTime(detailTarget.cancelled_at) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Annulée par</span>
                <span className="font-medium capitalize">{detailTarget.cancelled_by_username ?? '—'}</span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Motif</p>
                <p className="bg-base-200 rounded px-3 py-2 text-xs italic">
                  {detailTarget.cancellation_reason?.trim() || 'Aucun motif renseigné'}
                </p>
              </div>
            </div>

            <div className="modal-action mt-4">
              <button className="btn btn-sm btn-ghost" onClick={() => setDetailTarget(null)}>Fermer</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setDetailTarget(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
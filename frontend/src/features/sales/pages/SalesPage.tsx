import { useEffect, useState } from 'react';
import { Search, ReceiptText, Zap, Banknote, CalendarCheck, TrendingUp, Ban, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSales } from '../hooks/useSales';
import { cancelRemoval } from '../../stock/removals/api/removalsApi';
import { calculateTotals } from '../../invoices/utils/calculateTotals';
import InvoiceTemplate from '../components/InvoiceTemplate';
import QuickSaleModal from '../components/QuickSaleModal';
import PaymentModal from '../components/PaymentModal';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';
import Pagination from '../../../shared/components/ui/Pagination';
import DateRangeFilter from '../../../shared/components/ui/DateRangeFilter';
import { usePermission } from '../../../shared/hooks/usePermission';
import type { Removal } from '../../stock/removals/types';

const PAGE_SIZE = 20;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function SalesPage() {
  const { canRecordPayment, canCancelRemoval, isSuperUser, isOwner } = usePermission();

  const [currentPage,     setCurrentPage]     = useState(1);
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter,      setDateFilter]      = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Removal | null>(null);
  const [paymentTarget,   setPaymentTarget]   = useState<Removal | null>(null);
  const [detailTarget,    setDetailTarget]    = useState<Removal | null>(null);
  const [cancelTarget,    setCancelTarget]    = useState<Removal | null>(null);
  const [cancelReason,    setCancelReason]    = useState('');
  const [cancelling,      setCancelling]      = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { sales: fetchedSales, count, loading, refetch } = useSales(currentPage, debouncedSearch, dateFilter);
  const [sales, setSales] = useState<Removal[]>([]);
  useEffect(() => { setSales(fetchedSales); }, [fetchedSales]);

  const handlePaymentSuccess = (updated: Removal) => {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedInvoice?.id === updated.id) setSelectedInvoice(updated);
    setPaymentTarget(null);
  };

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
      toast.success('Vente annulée — stock et finance mis à jour');
      refetch();
      setCancelTarget(null);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  const totals     = calculateTotals(sales);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Factures de Ventes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Nbr total de factures" value={count}                                             color="badge-accent"  icon={<ReceiptText size={30} />} />
        <Card title="Factures aujourd'hui"  value={totals.numberOfInvoicesToday}                      color="badge-warning" icon={<CalendarCheck size={30} />} />
        <Card title="CA journalier"         value={`${totals.totalToday.toLocaleString('fr-FR')} F`} color="badge-success" icon={<Banknote size={30} />} />
        <Card title="CA mensuel"            value={`${totals.totalMonth.toLocaleString('fr-FR')} F`} color="badge-error"   icon={<TrendingUp size={30} />} />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8 items-center">
        <label className="input">
          <Search size={16} />
          <input
            type="search"
            placeholder="Rechercher facture / client"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>
        <Button variant="primary" size="md" onClick={() => (document.getElementById('quick_sale_modal') as HTMLDialogElement)?.showModal()}>
          <Zap size={15} /> Vente Rapide
        </Button>
        <DateRangeFilter value={dateFilter} onChange={(d) => { setDateFilter(d); setCurrentPage(1); }} />
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Référence</th><th>Date</th><th>Client</th>
              <th>Vendeur</th><th>Montant</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((row) => {
              const isCancelled    = row.invoice_status === 'annulee';
              const age            = daysSince(row.date_register);
              const isTooOld       = age > 7;
              const isOwnerOnly    = age > 2 && age <= 7;
              const canCancel      = canCancelRemoval || isSuperUser;
              const canForceCancel = isOwner || isSuperUser;

              return (
                <tr key={row.id} className={`hover:bg-base-200 ${isCancelled ? 'opacity-50' : ''}`}>
                  <td className={`font-mono text-xs ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                    {row.invoice?.invoice_number ?? '—'}
                  </td>
                  <td>
                    {row.date_register
                      ? new Date(row.date_register).toLocaleDateString('fr-FR')
                      : row.invoice?.date_created
                        ? new Date(row.invoice.date_created).toLocaleDateString('fr-FR')
                        : '—'}
                  </td>
                  <td>
                    <span>{row.client_name}</span>
                    {row.client_phone && (
                      <p className="text-[10px] text-gray-400 leading-tight">{row.client_phone}</p>
                    )}
                  </td>
                  <td className="text-xs capitalize text-gray-500">{row.created_by_username ?? '—'}</td>
                  <td className="font-semibold">{row.invoice?.total_amount?.toLocaleString('fr-FR')} F</td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      {isCancelled ? (
                        <button
                          className="badge badge-error badge-xs cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => setDetailTarget(row)}
                          title="Voir les détails d'annulation"
                        >
                          Annulée
                        </button>
                      ) : (
                        <span className={`badge badge-xs ${
                          row.invoice_status === 'payee'                                                ? 'badge-success' :
                          row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) === 0  ? 'badge-success' :
                          row.invoice_status === 'partiellement_payee'                                  ? 'badge-warning' : 'badge-ghost'
                        }`}>
                          {row.invoice_status === 'payee'                                                ? 'Payée'       :
                           row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) === 0  ? 'Payée'       :
                           row.invoice_status === 'partiellement_payee'                                  ? 'Part. payée' : 'En attente'}
                        </span>
                      )}
                      {row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) > 0 && (
                        <span className="text-xs text-orange-500">
                          {(row.balance_due ?? 0).toLocaleString('fr-FR')} restant
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="flex gap-1 items-center">
                    {!isCancelled && canRecordPayment
                      && row.invoice_status !== 'payee'
                      && (row.balance_due ?? 0) > 0 && (
                      <IconButton tooltip="Encaisser un paiement" color="primary" onClick={() => setPaymentTarget(row)}>
                        <Banknote size={14} />
                      </IconButton>
                    )}
                    {!isCancelled && (
                      <IconButton tooltip="Afficher facture" color="warning" onClick={() => handleShowInvoice(row)}>
                        <ReceiptText size={14} />
                      </IconButton>
                    )}
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
                        <IconButton tooltip="Annuler cette vente" color="danger" onClick={() => handleOpenCancel(row)}>
                          <Ban size={13} />
                        </IconButton>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
            {sales.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">Aucune vente trouvée.</td></tr>
            )}
          </tbody>
        </table>
        <InvoiceTemplate selectedInvoice={selectedInvoice} />
      </div>

      <Pagination currentPage={currentPage} total={totalPages} onChange={setCurrentPage} />
      <QuickSaleModal onSuccess={(created) => { setSales((prev) => [created, ...prev]); refetch(); }} />
      <PaymentModal
        removal={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSuccess={handlePaymentSuccess}
      />

      {/* ── Modal confirmation annulation ── */}
      {cancelTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Ban size={16} className="text-red-500" />
                Annuler cette vente ?
              </h3>
              <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setCancelTarget(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="bg-base-200 rounded-lg px-4 py-3 text-sm mb-4 space-y-1">
              <p>
                <span className="text-gray-500">Facture :</span>{' '}
                <span className="font-mono font-semibold">{cancelTarget.invoice?.invoice_number ?? '—'}</span>
              </p>
              {cancelTarget.client_name && (
                <p><span className="text-gray-500">Client :</span> {cancelTarget.client_name}</p>
              )}
              <p>
                <span className="text-gray-500">Date :</span>{' '}
                {new Date(cancelTarget.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {cancelTarget.invoice?.total_amount && (
                <p>
                  <span className="text-gray-500">Montant :</span>{' '}
                  <span className="font-semibold text-red-500">{cancelTarget.invoice.total_amount.toLocaleString('fr-FR')} F</span>
                </p>
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
                {cancelling ? <span className="loading loading-spinner loading-xs" /> : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setCancelTarget(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* ── Modal détails annulation ── */}
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
                <span className="text-gray-500">Facture</span>
                <span className="font-mono font-semibold">{detailTarget.invoice?.invoice_number ?? '—'}</span>
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
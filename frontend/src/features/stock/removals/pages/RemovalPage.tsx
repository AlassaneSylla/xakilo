import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Minus, ReceiptText, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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

function isSameDay(dateStr: string | null | undefined, filter: string): boolean {
  if (!filter || !dateStr) return false;
  return new Date(dateStr).toLocaleDateString('fr-CA') === filter;
}

const DEST_LABELS: Record<string, string> = { vente: 'Vente', don: 'Don', perte: 'Perte' };
const DEST_COLORS: Record<string, string> = {
  vente: 'text-emerald-600',
  don:   'text-blue-500',
  perte: 'text-red-500',
};

export default function RemovalPage() {
  const { removals, loading, refetch } = useRemovals();
  const { canCancelRemoval, isSuperUser } = usePermission();
  const [selectedInvoice, setSelectedInvoice] = useState<Removal | null>(null);
  const [search,      setSearch]      = useState('');
  const [dateFilter,  setDateFilter]  = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = removals.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || (r.client_name  ?? '').toLowerCase().includes(q)
      || (r.removal_ref  ?? '').toLowerCase().includes(q)
      || (r.destination  ?? '').toLowerCase().includes(q);
    const matchDate = !dateFilter || isSameDay(r.date_register, dateFilter);
    return matchSearch && matchDate;
  });

  const total        = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleShowInvoice = (removal: Removal) => {
    setSelectedInvoice(removal);
    (document.getElementById('invoice_modal') as HTMLDialogElement)?.showModal();
  };

  const handleCancel = async (removal: Removal) => {
    const destLabel = DEST_LABELS[removal.destination] ?? removal.destination;
    const result = await Swal.fire({
      title: `Annuler cette ${destLabel.toLowerCase()} ?`,
      html: `
        <p class="text-sm text-gray-600">
          Le stock des produits concernés sera <strong>restauré automatiquement</strong>.
          Cette action est <strong>irréversible</strong>.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;
    try {
      await cancelRemoval(removal.id);
      toast.success('Sortie annulée — stock restauré');
      refetch();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? 'Erreur lors de l\'annulation');
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
        <p className="text-xs text-gray-400 mb-3">{filtered.length} résultat(s)</p>
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
            {currentItems.map((row) => {
              const isSale      = row.destination === 'vente';
              const isCancelled = row.invoice_status === 'annulee';
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
                      <span className="badge badge-error badge-xs">Annulée</span>
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
                      {(canCancelRemoval || isSuperUser) && !isCancelled && (
                        <IconButton tooltip="Annuler cette sortie" color="danger" onClick={() => handleCancel(row)}>
                          <Ban size={13} />
                        </IconButton>
                      )}
                      {isSale && !isCancelled && (
                        <IconButton tooltip="Afficher facture" color="warning" onClick={() => handleShowInvoice(row)}>
                          <ReceiptText size={13} />
                        </IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentItems.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8">Aucune sortie trouvée.</td></tr>
            )}
          </tbody>
        </table>
        <InvoiceTemplate selectedInvoice={selectedInvoice} />
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Search, ReceiptText, Zap, Banknote } from 'lucide-react';

import { useSales } from '../hooks/useSales';
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

function isSameDay(dateStr: string | null | undefined, filter: string): boolean {
  if (!filter || !dateStr) return false;
  return new Date(dateStr).toLocaleDateString('fr-CA') === filter;
}

export default function SalesPage() {
  const { sales: fetchedSales, loading } = useSales();
  const [sales, setSales] = useState<Removal[]>([]);
  const { canRecordPayment } = usePermission();
  const [selectedInvoice, setSelectedInvoice] = useState<Removal | null>(null);
  const [paymentTarget,   setPaymentTarget]   = useState<Removal | null>(null);

  // Synchronise les données réseau dans le state local
  useEffect(() => { setSales(fetchedSales); }, [fetchedSales]);

  // Mise à jour instantanée de la ligne + modale facture après paiement (sans refetch)
  const handlePaymentSuccess = (updated: Removal) => {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedInvoice?.id === updated.id) setSelectedInvoice(updated);
    setPaymentTarget(null);
  };
  const [currentPage,  setCurrentPage]  = useState(1);
  const [search,       setSearch]       = useState('');
  const [dateFilter,   setDateFilter]   = useState('');
  const PER_PAGE = 6;

  const totals = calculateTotals(sales);

  const filtered = sales.filter((s: Removal) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || (s.client_name ?? '').toLowerCase().includes(q)
      || (s.invoice?.invoice_number ?? '').toLowerCase().includes(q);
    const dateStr = s.date_register ?? s.invoice?.date_created;
    const matchDate = !dateFilter || isSameDay(dateStr, dateFilter);
    return matchSearch && matchDate;
  });

  const total        = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleShowInvoice = (removal: Removal) => {
    setSelectedInvoice(removal);
    (document.getElementById('invoice_modal') as HTMLDialogElement)?.showModal();
  };

  const handleQuickSale = () => {
    (document.getElementById('quick_sale_modal') as HTMLDialogElement)?.showModal();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Factures de Ventes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Nombre total de factures" value={sales.length}                                         color="badge-accent"  />
        <Card title="Factures aujourd'hui"      value={totals.numberOfInvoicesToday}                         color="badge-warning" />
        <Card title="CA journalier"             value={`${totals.totalToday.toLocaleString('fr-FR')} F`} color="badge-success" />
        <Card title="CA mensuel"                value={`${totals.totalMonth.toLocaleString('fr-FR')} F`} color="badge-error"   />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8 items-center">
        <label className="input">
          <Search size={16} />
          <input type="search" placeholder="Rechercher facture / client"
            value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </label>
        <Button variant="primary" size="md" onClick={handleQuickSale}>
          <Zap size={15} /> Vente Rapide
        </Button>
        <DateRangeFilter value={dateFilter} onChange={(d) => { setDateFilter(d); setCurrentPage(1); }} />
      </div>

      {(search || dateFilter) && (
        <p className="text-xs text-gray-400 mb-3">{filtered.length} résultat(s)</p>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Référence</th><th>Date</th><th>Client</th>
              <th>Vendeur</th><th>Montant</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row) => (
              <tr key={row.id} className="hover:bg-base-200">
                <td className="font-mono text-xs">{row.invoice?.invoice_number ?? '—'}</td>
                <td>{row.date_register
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
                    <span className={`badge badge-xs ${
                      row.invoice_status === 'payee'                                                    ? 'badge-success' :
                      row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) === 0      ? 'badge-success' :
                      row.invoice_status === 'partiellement_payee'                                      ? 'badge-warning' :
                      row.invoice_status === 'annulee'                                                  ? 'badge-error'   : 'badge-ghost'
                    }`}>
                      {row.invoice_status === 'payee'                                                   ? 'Payée'       :
                       row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) === 0     ? 'Payée'       :
                       row.invoice_status === 'partiellement_payee'                                     ? 'Part. payée' :
                       row.invoice_status === 'annulee'                                                 ? 'Annulée'     : 'En attente'}
                    </span>
                    {row.invoice_status === 'partiellement_payee' && (row.balance_due ?? 0) > 0 && (
                      <span className="text-xs text-orange-500">
                        {(row.balance_due ?? 0).toLocaleString('fr-FR')} restant
                      </span>
                    )}
                  </div>
                </td>
                <td className="flex gap-1 items-center">
                  {canRecordPayment
                    && row.invoice_status !== 'payee'
                    && row.invoice_status !== 'annulee'
                    && (row.balance_due ?? 0) > 0 && (
                    <IconButton tooltip="Encaisser un paiement" color="primary" onClick={() => setPaymentTarget(row)}>
                      <Banknote size={14} />
                    </IconButton>
                  )}
                  <IconButton tooltip="Afficher facture" color="warning" onClick={() => handleShowInvoice(row)}>
                    <ReceiptText size={14} />
                  </IconButton>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">Aucune vente trouvée.</td></tr>
            )}
          </tbody>
        </table>
        <InvoiceTemplate selectedInvoice={selectedInvoice} />
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />
      <QuickSaleModal onSuccess={(created) => setSales((prev) => [created, ...prev])} />
      <PaymentModal
        removal={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
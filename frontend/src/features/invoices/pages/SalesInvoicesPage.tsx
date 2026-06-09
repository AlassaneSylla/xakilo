import { useState } from 'react';
import { Search, ListFilter, SquarePen, Ban, ReceiptText } from 'lucide-react';

import { useInvoices } from '../hooks/useInvoices';
import { calculateTotals } from '../utils/calculateTotals';
import InvoiceTemplate from '../components/InvoiceTemplate';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';
import Pagination from '../../../shared/components/ui/Pagination';
import type { Removal } from '../../stock/removals/types';

export default function SalesInvoicesPage() {
  const { invoices, loading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Removal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 6;

  const totals = calculateTotals(invoices);
  const total = Math.ceil(invoices.length / PER_PAGE);
  const currentItems = invoices.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleShowInvoice = (removal: Removal) => {
    setSelectedInvoice(removal);
    (document.getElementById('invoice_modal') as HTMLDialogElement)?.showModal();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Factures de Ventes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        <Card title="📊 Nombre total de factures"     value={invoices.length}                color="badge-accent"  />
        <Card title="🧾 Factures émises aujourd'hui"  value={totals.numberOfInvoicesToday}   color="badge-warning" />
        <Card title="💰 Montant journalier facturé"   value={totals.totalToday.toLocaleString()} color="badge-success" />
        <Card title="💹 Montant mensuel facturé"      value={totals.totalMonth.toLocaleString()} color="badge-error"   />
      </div>

      <div className="grid grid-cols-3 gap-10 mb-8">
        <label className="input"><Search /><input type="search" placeholder="Rechercher" /></label>
        <div />
        <Button variant="greyghost" size="md"><ListFilter /> Filtrer</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200 text-[var(--black)]">
              <th>📦 Référence</th><th>📅 Date</th><th>👤 Client</th>
              <th>💵 Montant total</th><th>💳 Statut</th><th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody className="transition-all duration-300">
            {currentItems.map((row) => (
              <tr key={row.id} className="hover:bg-base-200">
                <td>{row.invoice?.invoice_number ?? '—'}</td>
                <td>{row.invoice?.date_created ? new Date(row.invoice.date_created).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{row.client_name}</td>
                <td>{row.invoice?.total_amount?.toLocaleString()} F CFA</td>
                <td>
                  <span className={`badge ${
                    row.invoice?.status === 'payee'    ? 'badge-success' :
                    row.invoice?.status === 'annulee'  ? 'badge-error'   : 'badge-warning'
                  }`}>
                    {row.invoice?.status}
                  </span>
                </td>
                <td className="flex gap-1 items-center">
                  <IconButton tooltip="Modifier statut" color="primary"><SquarePen size={14} /></IconButton>
                  <IconButton tooltip="Annuler" color="danger"><Ban size={14} /></IconButton>
                  <IconButton tooltip="Afficher facture" color="warning" onClick={() => handleShowInvoice(row)}>
                    <ReceiptText size={14} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <InvoiceTemplate selectedInvoice={selectedInvoice} />
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />
    </div>
  );
}

import { useRef } from "react";
import { useState } from "react";
import { useData } from "../context/DataContext"; 
import { calculateTotals } from "../utils/InvoicesUtils";
import { Search, Plus, ListFilter, SquarePen, Ban } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import InvoiceModal, { type InvoiceModalHandle } from "./SelectedInvoice";


export default function SalesInvoices() {

  const modalRef = useRef<InvoiceModalHandle>(null);

  const { invoices } = useData();

  //for pagination
  const [ currentPage, setCurrentPage ] = useState(1);
  const itemsPerPage = 6;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(invoices.length / itemsPerPage);

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Factures de Ventes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        <Card title='📊 Nombre total de factures' totalProduct={invoices.length} color='badge-accent'/>
        <Card title="🧾 factures émises aujourd'hui" totalProduct={calculateTotals(invoices).numberOfInvoicesOfTheDay.length} color='badge-warning'/>
        <Card title="💰 Montant journalier facturé" totalProduct={calculateTotals(invoices).totalToday} color='badge-success'/>
        <Card title='💹 Montant mensuel facturé' totalProduct={calculateTotals(invoices).totalMonth} color='badge-error'/>
        {/* <Card title='Produits en rupture' totalProduct={calculateTotals(invoices).totalYear} color='badge-error'/> */}
      </div>

      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button variant="primary" size="md">
              <Plus /> Ajouter produit
          </Button>
          <Button variant="greyghost" size="md">
              <ListFilter /> Filtrer Produits
          </Button>
      </div>

      <div className='overfow-x-auto'>
        <table className="table w-full">
          <thead>
            <tr className="bg-base-100">
              <th>📦 Référence</th>
              <th>📅 Date</th>
              <th>👤 Client</th>
              <th>💵 Montant total</th>
              <th>💳 Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((inv, index) => (
              <tr key={index} className="hover:bg-base-200">
                <td>{inv.reference}</td>
                <td>{inv.date.toLocaleDateString('fr-FR')}</td>
                <td>{inv.client}</td>
                <td>{inv.totalAmount.toLocaleString()} F CFA</td>
                <td>
                  <span
                    className={`badge ${
                      inv.paymentStatus === 'Payée'
                        ? 'badge-success'
                        : inv.paymentStatus === 'Annulée'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}
                  >
                    {inv.paymentStatus}
                  </span>
                </td>
                <td className="flex flex-direction-row gap-6">
                  <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)] tooltip" data-tip="modifier status"
                  >
                    <SquarePen/>
                  </button>
                  <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:red] tooltip" data-tip="annuler"
                  >
                    <Ban />
                  </button>
                  <button 
                    onClick={() => modalRef.current?.open(inv)}
                    className="btn btn-xs btn-outline hover:text-[color:var(--brokenWhite)] hover:bg-[color:var(--black)]"
                  >
                    Afficher
                  </button>
                  <InvoiceModal ref={modalRef} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button 
          className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>

        <span className="px-3 py-1 text-xs">
          Page {currentPage} sur ( {numberOfPages} )  
        </span>

        <button 
          className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={indexOfLast >= invoices.length}
        >
          Suivant
        </button>
      </div>
  
    </div>
  );
}

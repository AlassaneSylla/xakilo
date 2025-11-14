import { useState, useEffect } from 'react';
import { getRemovals } from '../api/removalsApi';

import { Search, ListFilter, Minus } from 'lucide-react';
import Button from "../components/Button";
import { SquarePen, Trash, ReceiptText } from 'lucide-react';
import InvoiceTemplate from '../components/Template'


export default function Removal() {
  const [removals, setRemovals] = useState<any[]>([]);

  //for modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleShowInvoice = (removal: any) => {
    setSelectedInvoice(removal);
    const modal = document.getElementById("invoice_modal") as HTMLDialogElement;
    modal?.showModal();
  };

  useEffect(() => {
    getRemovals()
      .then((data) => setRemovals(data))
      .catch((error) => console.log('Error GGET Removals', error));
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = removals.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(removals.length / itemsPerPage);
   
  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">table des Sorties</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
        <label className="input">
          <Search />
          <input type="search" required placeholder="Rechercher" />
        </label>
        <Button variant="primary" size="md">
          <Minus /> Enregistrer une sortie
        </Button>
        <Button variant="greyghost" size="md">
          <ListFilter /> Filtrer Sorties
        </Button>
      </div>
      <div className='overfow-x-auto'>
        <table className="table">
          <thead>
            <tr className="bg-base-200 text-[var(--black)]">
              <th>🧾 N° Facture</th>
              <th>👤 Client</th>
              <th>🎯 Destination</th>
              <th>💰 Montant Total</th>
              <th>📅 Date</th>
              <th>👷 Créé par</th>
              <th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody className='transition-all duration-300 ease-in-out'>
            {currentItems.map((row, index) => (
              <tr key={index} className="hover:bg-base-200">
                <th>{row.invoice.invoice_number}</th>
                <td>{row.client_name}</td>
                <td className='text-xs'>{row.destination}</td>
                <td>{row.invoice?.total_amount?.toLocaleString()}</td>
                <td>{new Date(row.invoice?.date_created).toLocaleDateString()}</td>
                <td className='capitalize'>{row.created_by_username}</td> 
                <td className='flex flex-direction-row gap-2'>
                  <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)] tooltip" data-tip='modifier'
                  >
                    <SquarePen/>
                  </button>
                  <button 
                    className="btn btn-xs bg-transparent border border-0 hover:text-[color:red] tooltip" 
                    data-tip='supprimer'
                  >
                    <Trash />
                  </button>
                  <button 
                    className='btn btn-xs bg-transparent border border-0 hover:text-amber-700 tooltip' 
                    data-tip='afficher facture'
                    onClick={() => handleShowInvoice(row)}
                  >
                    <ReceiptText />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Template facture  */}
        <InvoiceTemplate selectedInvoice={selectedInvoice} />

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
          disabled={indexOfLast >= removals.length}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}


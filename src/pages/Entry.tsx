import { useData } from '../context/DataContext';
import { useState } from 'react';
import { Search, Plus, ListFilter } from 'lucide-react';
import Button from "../components/Button"
import { SquarePen, Trash } from 'lucide-react';


export default function Entry() {
  const { entries } = useData();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = entries.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(entries.length / itemsPerPage);
   
  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Table des Entrées</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button variant="primary" size="md">
              <Plus /> Ajouter une entrée
          </Button>
          <Button variant="greyghost" size="md">
              <ListFilter /> Filtrer Entrée
          </Button>
      </div>
      <div className='overfow-x-auto'>
          <table className="table">
              <thead>
                <tr className="bg-base-200">
                  <th>Produits</th>
                  <th>Catégorie</th>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Quantité</th>
                  <th>Fournisseur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200">
                    <th>{row.product}</th>
                    <td>{row.category}</td>
                    <td>{row.reference}</td>
                    <td>{row.dateRegister.toLocaleDateString()}</td>
                    <td>{row.quantity}</td>
                    <td>{row.supplier}</td>
                    <td className='flex flex-direction-row gap-6'>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)]"
                      >
                        <SquarePen/>
                      </button>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:red]"
                      >
                        <Trash />
                      </button>
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
          disabled={indexOfLast >= entries.length}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}


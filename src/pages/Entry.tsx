import { useState } from 'react';
import { Search, Plus, ListFilter } from 'lucide-react';
import Button from "../components/Button"
import { SquarePen, Trash } from 'lucide-react';


type Entry = {
  product: string;
  category: string;
  dateRegister: Date;
  quantity: number;
  supplier: string;
  reference: string;
};

const mockEntries: Entry[] = [
  { product: 'Clavier AZERTY', category: 'Informatique', dateRegister: new Date('2025-10-01'), quantity: 50, supplier: 'TechCorp', reference: '0001' },
  { product: 'Souris sans fil', category: 'Informatique', dateRegister: new Date('2025-10-02'), quantity: 30, supplier: 'TechCorp', reference: '0054' },
  { product: 'Écran LED Samsung', category: 'Électronique', dateRegister: new Date('2025-10-02'), quantity: 20, supplier: 'ElecPro', reference: '0987' },
  { product: "HP Elitebook 845", category: 'Informatique', dateRegister: new Date('2024-12-24'), quantity: 175, supplier: 'Infinity Services', reference: '0398'},
  { product: "Ventilateur", category: 'Electronique', dateRegister: new Date('2024-10-03'), quantity: 200, supplier: 'Elecronics Corps', reference: '03ty8'},
  { product: "Iphone 17", category: 'Electronique', dateRegister: new Date('2025-09-24'), quantity: 225, supplier: 'Fuladu', reference: '08598'},
  { product: "Hoofer", category: 'Electronique', dateRegister: new Date('2025-11-04'), quantity: 90, supplier: 'Electro SN', reference: '9398'}
];


function Entry() {
  const [entry] = useState<Entry[]>(mockEntries);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = entry.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(entry.length / itemsPerPage);
   
  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Table des Entrées</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button variant="primary" size="md">
              <Plus /> Effectuer Entrée
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
                  <th>Référence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200 cursor-pointer">
                    <th>{row.product}</th>
                    <td>{row.category}</td>
                    <td>{row.reference}</td>
                    <td>{row.dateRegister.toLocaleDateString()}</td>
                    <td>{row.quantity}</td>
                    <td>{row.supplier}</td>
                    <td>{row.reference}</td>
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
          disabled={indexOfLast >= entry.length}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default Entry
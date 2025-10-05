import { useState } from 'react';
import { Search, Plus, ListFilter } from 'lucide-react';
import Button from "../components/Button"
import { SquarePen, Trash } from 'lucide-react';


type Product = {
  productName: string;
  category: string;
  reference: string;
  stock: number;
  unitPrice: number;
};

const mockProducts: Product[] = [
  {productName: 'clavier AZERTY', category: 'informatique', reference: '0001', stock: 125, unitPrice: 15000},
  {productName: 'souris sans fil', category: 'informatique', reference: '0054', stock: 75, unitPrice: 3500},
  {productName: 'écran LED samsung', category: 'électronique', reference: '0987', stock: 100, unitPrice: 250000},
  {productName: 'Chaise de bureau', category: 'moblier', reference: '2560', stock: 50, unitPrice: 45000},
  {productName: 'Bureau en bois', category: 'meublier', reference: '0974', stock: 80, unitPrice: 110000},
  {productName: 'Imprimante Lazer JetSet', category: 'électronique', reference: '2890', stock: 55, unitPrice: 35000},
  {productName: 'Tapis de souris', category: 'informatique', reference: '7820', stock: 200, unitPrice: 2000},
  {productName: 'Clé USB 64Go', category: 'électronique', reference: '29871', stock: 100, unitPrice: 4000},
  {productName: 'Disc dure ext', category: 'informatique', reference: '7783', stock: 200, unitPrice: 7000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000},
  {productName: 'Lamp de bureau', category: 'électronique', reference: '8894', stock: 300, unitPrice: 5000}
]

function Products() {
  const [products] = useState<Product[]>(mockProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = products.slice(indexOfFirst, indexOfLast);
  const numberOfPages = products.length / itemsPerPage;
   
  return (
    <div>
      <h1 className="text-2xl font-bold">Liste Produits</h1>
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
          <table className="table">
              <thead>
                <tr className="bg-base-200">
                  <th>Nom Produit</th>
                  <th>Catégorie</th>
                  <th>Référence</th>
                  <th>Stock</th>
                  <th>Prix Unitaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200 cursor-pointer">
                    <th>{row.productName}</th>
                    <td>{row.category}</td>
                    <td>{row.reference}</td>
                    <td>{row.stock}</td>
                    <td>{row.unitPrice}</td>
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
          disabled={indexOfLast >= products.length}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default Products
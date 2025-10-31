import { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';

import { Link } from 'react-router-dom';
import { Search, Plus, ListFilter } from 'lucide-react';
import Button from "../components/Button"
import { SquarePen, Trash } from 'lucide-react';


export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error GET products", error))
      .finally(() => setLoading(false));
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = products.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(products.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-[var(--primary)]"></span>
      </div>
    );
  }
   
  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Liste Produits</h1>
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
                <tr className="bg-base-200 text-[var(--black)]">
                  <th>🏷️ Produit</th>
                  <th>📂 Catégorie</th>
                  <th>🔢 Référence</th>
                  <th>📦 Stock</th>
                  <th>💰 Prix Unitaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200">
                    <td className='capitalize'>{row.product_name}</td>
                    <td className='capitalize'>{row.category}</td>
                    <td>{row.reference}</td>
                    <td>{row.stock}</td>
                    <td>{row.unit_price}</td>
                    <td className='flex flex-direction-row gap-6'>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)]"
                      >
                        <SquarePen/>
                      </button>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:red]"
                      >
                        <Trash />
                      </button>
                      <Link 
                        to={`/products/${row.id}/fiche-stock`} 
                        state={{ product: row }} //get product data
                        className="btn btn-xs btn-outline hover:text-[color:var(--brokenWhite)] hover:bg-[color:var(--black)]"
                      >
                        Voir Fiche
                      </Link>
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

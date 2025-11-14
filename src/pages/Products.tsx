import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ListFilter,  SquarePen, Trash } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { getProducts, postProduct, updateProduct, deleteProduct } from '../api/productApi';
import Modal from '../components/Modal';
import Button from "../components/Button"
import Form from '../components/Form';


interface ProductForm {
  product_name: string;
  category: string;
  stock: number;
  unit_price: number;
  purchase_price: number;
  alert: number;
}

type NewProductForm = {
  product_name: string;
  category: string;
  unit_price: number;
  purchase_price: number;
  alert: number;
};


export default function Products() {
  const editModalRef = useRef<{ open: () => void; close: () => void }>(null);
  const addModalRef = useRef<{ open: () => void; close: () => void }>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    product_name: "",
    category: "",
    stock: 0,
    unit_price: 0,
    purchase_price: 0,
    alert: 0,
  });
  const [newProductFormData, setNewProductFormData] = useState<NewProductForm>({
    product_name: "",
    category: "",
    unit_price: 0,
    purchase_price: 0,
    alert: 0,
  })
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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

  //formulaire pour ajout et modifier
  const fields = [
    { name: "product_name", label: "Produit", required: true, disabled: true },
    { name: "category", label: "Catégorie", disabled: true },
    { name: "stock", label: "Stock", type: "number", disabled: true },
    { name: "unit_price", label: "Prix unitaire", type: "number" },
    { name: "purchase_price", label: "Prix d'achat", type: "number" },
    { name: "alert", label: "Seuil d'alerte", type: "number" }
  ];

  //formulaire pour ajout et modifier
  const addProductfields = [
    { name: "product_name", label: "Produit", required: true },
    { name: "category", label: "Catégorie", required: true },
    { name: "unit_price", label: "Prix unitaire", type: "number", required: true },
    { name: "purchase_price", label: "Prix d'achat", type: "number", required: true },
    { name: "alert", label: "Seuil d'alerte", type: "number", required: true }
  ];

  const CONFIRM_TOAST_ID = "delete-confirm";
  const handleDelete = (id: number) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-gray-300 ring-opacity-3`}
      >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Trash />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Voulez-vous supprimer ce produit ?
            </p>
            {/* <p className="mt-1 text-sm text-gray-500">
              Vous ne pouvez plus recuperer
            </p> */}
          </div>
          <div>
            <button
            className="btn btn-xs btn-error"
            onClick={() => {
              deleteProduct(id)
                .then(() => {
                  setProducts(products.filter(p => p.id !== id)); 
                  toast.success("Produit supprimé !");
                })
                .catch(() => toast.error("Erreur lors de la suppression"));
              toast.dismiss(CONFIRM_TOAST_ID); 
            }}
          >
            Oui
          </button>
          </div>
        </div>
      </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(CONFIRM_TOAST_ID)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[var(--primary)] hover:text-cyan-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Non
      </button>
    </div>
  </div>
    ), { id: CONFIRM_TOAST_ID });
  };

  //ppour modal edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  //update produit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (selectedProductId !== null) {
      updateProduct(selectedProductId, formData)
        .then((updated) => {
          // maj produit
          setProducts((prev) =>
            prev.map((p) => (p.id === selectedProductId ? updated : p))
          );
          setTimeout(() => {
            editModalRef.current?.close();
            setLoading(false);
          }, 800);
          toast.success("Produit mis à jour avec succès !");
        })
        .catch((err) => {
          console.error("Erreur update :", err);
          toast.error("Échec de la mise à jour du produit !");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  // Pour le modal d’ajout
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewProductFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  //ajout produit
  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const newProduct = await postProduct(newProductFormData);

      //mettre a jour la liste apres ajout
      setProducts((prev) => [newProduct, ...prev])

      setTimeout(() => {
        addModalRef.current?.close();
        setLoading(false);
      }, 800);

      toast.success("Produit ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      toast.error("Erreur lors de l'ajout du produit !");
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-2xl font-bold uppercase">Liste Produits</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button 
            id='add'
            variant="primary" 
            size="md"
            onClick={() => {          
              setNewProductFormData({                            
                product_name: "",
                category: "",
                unit_price: 0,
                purchase_price: 0,
                alert: 0,
              });
              addModalRef.current?.open();          
            }}
          >
            <Plus /> Ajouter produit
          </Button>

          {/* Ajouter un produit */}
          <Modal ref={addModalRef} title="AJOUTER PRODUIT">
            <Form 
              fields={addProductfields} 
              values={newProductFormData} 
              onChange={handleAddChange} 
              onSubmit={handleAddProduct} 
              submitLabel='Ajouter'
              loading={loading}
            />
          </Modal>

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
              <th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody className='transition-all duration-300 ease-in-out'>
            {currentItems.map((row, index) => (
              <tr key={index} className="hover:bg-base-200">
                <td className='capitalize'>{row.product_name}</td>
                <td className='capitalize'>{row.category}</td>
                <td className='text-xs'>{row.product_ref}</td>
                <td className='font-bold'>{row.stock}</td>
                <td>{row.unit_price}</td>
                <td className='flex flex-direction-row gap-6'>
                  <button 
                    className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)]"
                    id='edit'
                    onClick={() => {
                      setSelectedProductId(row.id);           
                      setFormData({                            
                        product_name: row.product_name,
                        category: row.category,
                        stock: row.stock,
                        unit_price: row.unit_price,
                        purchase_price: row.purchase_price,
                        alert: row.alert,
                      });
                      editModalRef.current?.open();          
                    }}
                  >
                    <SquarePen />
                  </button>

                  {/* MOdal pour modifier */}
                  <Modal ref={editModalRef} title="Modifier le produit">
                    <Form 
                      fields={fields} 
                      values={formData} 
                      onChange={handleEditChange} 
                      onSubmit={handleSubmit}
                      submitLabel='Mettre à jour' 
                      loading={loading}
                    />
                  </Modal>

                  <button 
                    className="btn btn-xs bg-transparent border border-0 hover:text-[color:red]"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash />
                  </button>
                  
                  <Link 
                    to={`/products/${row.id}/fiche-stock`} 
                    state={{ product: row }} 
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

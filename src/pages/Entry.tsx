import { useEffect, useRef, useState } from 'react';
import { getProducts } from '../api/productApi';
import { getEntries, postEntry, updateEntry, deleteEntry } from '../api/entriesApi';

import Modal from '../components/Modal';
import Form from '../components/Form';
import Button from "../components/Button"
import { Search, Plus, ListFilter } from 'lucide-react';
import { SquarePen, Trash } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';


interface NewEntryForm {
  quantity: number;
  supplier: string;
  category: string;
  product: number; 
}

export default function Entry() {
  const [entryProduct, setEntryProduct] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newEntryForm, setNewEntryForm] = useState<NewEntryForm>({
    quantity: 0,
    supplier: "",
    category: "",
    product: 0,
  })
  const addEntryModalRef = useRef<{ open: () => void; close: () => void }>(null);
  
  const [editEntryForm, setEditEntryForm] = useState<NewEntryForm>({
    quantity: 0,
    supplier: "",
    category: "",
    product: 0,
  })
  const editEntryModalRef = useRef<{ open: () => void; close: () => void }>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  useEffect(() => {
    getEntries()
      .then((data) => setEntries(data))
      .catch((error) => console.log("Error Get Entries", error))
  }, []);

  useEffect(() => {
    getProducts()
      .then((data) => setEntryProduct(data))
      .catch((err) => console.error("Liste produits non trouvee : ", err))
  })

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = entries.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(entries.length / itemsPerPage);


  //formulaire pour ajout entree
  const entryFields = [
    {
      name: "product",
      label: "Produit",
      required: true,
      options: entryProduct.map((p) => ({
        value: p.id,
        label: p.product_name,
      })),
    },
    { name: "quantity", label: "Quantité", type: "number", required: true },
    { name: "supplier", label: "Fournisseur", required: true },
    { name: "category", label: "Catégorie", disabled: true, readOnly: true },
  ];

  const updateEntryFields = [
    {
      name: "product",
      label: "Produit",
      required: true,
      options: entryProduct.map((p) => ({
        value: p.id,
        label: p.product_name,
      })),
      readOnly: true,
      disabled: true
    },
    { name: "category", label: "Catégorie", disabled: true, readOnly: true }, 
    { name: "quantity", label: "Quantité", type: "number", required: true },
    { name: "supplier", label: "Fournisseur", required: true }, 
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
    const { name, value } = e.target;

    setNewEntryForm((prev) => {
      if (name === "product") {

        const selectedProduct = entryProduct.find((p) => p.id === Number(value));

        return {
          ...prev,
          product: Number(value),
          category: selectedProduct ? selectedProduct.category : "", // récupération de la catégorie
        };
      }

      // Autres champs (quantity, supplier...)
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  //modal add entry
  const handleAddEntry = async () => {
    setLoading(true);
    try {
      const newEntry = await postEntry(newEntryForm);

      //mettre a jour la liste apres ajout
      setEntries((prev) => [newEntry, ...prev])

      setTimeout(() => {
        addEntryModalRef.current?.close();
        setLoading(false);
      }, 800);

      toast.success("Entrée ajoutée avec succès !");
 
      addEntryModalRef.current?.close();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entrée :", error);
      toast.error("Erreur lors de l'ajout de l'entrée !");
      setLoading(false);
    }
  };

  //gestion de mise a jour
  const handleEditChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

    setEditEntryForm((prev) => {
      if (name === "product") {
        const selectedProduct = entryProduct.find((p) => p.id === Number(value));
        return {
          ...prev,
          product: Number(value),
          category: selectedProduct ? selectedProduct.category : "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  //enregistrer maj entry
  const handleUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (selectedEntryId !== null) {
      updateEntry(selectedEntryId, editEntryForm)
        .then((updated) => {
          // maj produit
          setEntries((prev) =>
            prev.map((p) => (p.id === selectedEntryId ? updated : p))
          );
          setTimeout(() => {
            editEntryModalRef.current?.close();
            setLoading(false);
          }, 800);
          toast.success("Entree mis à jour avec succès !");
        })
        .catch((err) => {
          console.error("Erreur update :", err);
          toast.error("Échec mise à jour entree !");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  //delete entry
  const CONFIRM_TOAST_ID = "delete-confirm";
  const handleDeleteEntry = (id: number) => {
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
              Voulez-vous supprimer cette entrée ?
            </p>
          </div>
          <div>
            <button
            className="btn btn-xs btn-error"
            onClick={() => {
              deleteEntry(id)
                .then(() => {
                  setEntries(entries.filter(e => e.id !== id)); 
                  toast.success("Entreé supprimée !");
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
   
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-2xl font-bold uppercase">Table des Entrées</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button 
            variant="primary" 
            size="md"
             onClick={() => {          
              setNewEntryForm({                            
                quantity: 0,
                supplier: "",
                category: "",
                product: 0,
              });
              addEntryModalRef.current?.open();          
            }}
          >
              <Plus /> Ajouter une entrée
          </Button>

          {/* Ajouter une entree */}
          <Modal ref={addEntryModalRef} title="AJOUTER UNE ENTRÉE">
            <Form
              fields={entryFields}
              values={newEntryForm}
              onChange={handleChange}
              onSubmit={(e) => {
                e.preventDefault();
                handleAddEntry();
              }}
              submitLabel="Ajouter"
              loading={loading}
            />
          </Modal>


          <Button variant="greyghost" size="md">
              <ListFilter /> Filtrer Entrée
          </Button>
      </div>
      <div className='overfow-x-auto'>
          <table className="table">
              <thead>
                <tr className="bg-base-200 text-[var(--black)]">
                  <th>🏷️ Produits</th>
                  <th>📂 Catégorie</th>
                  <th>🔢 Référence</th>
                  <th>📅 Date</th>
                  <th>📦 Quantité</th>
                  <th>🚚 Fournisseur</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200">
                    <th className='font-semibold'>{row.product_name}</th>
                    <td>{row.category}</td>
                    <td className='text-xs'>{row.entry_reference}</td>
                    <td>
                      {new Date(row.date_register).toLocaleDateString()}
                    </td>
                    <td className='text-green-700'>{row.quantity}</td>
                    <td>{row.supplier}</td>
                    <td className='flex flex-direction-row gap-2'>
                        <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)]"
                        onClick={() => {
                        setSelectedEntryId(row.id);           
                        setEditEntryForm({                            
                          product: row.product,
                          quantity: row.quantity,
                          supplier: row.supplier,
                          category: row.category,
                        });
                        editEntryModalRef.current?.open();          
                        }}
                        >
                          <SquarePen/>
                        </button>

                        {/* MOdal pour modifier */}
                        <Modal ref={editEntryModalRef} title="Modifier l'entree">
                          <Form 
                            fields={updateEntryFields} 
                            values={editEntryForm} 
                            onChange={handleEditChange} 
                            onSubmit={handleUpdateEntry}
                            submitLabel='Mettre à jour' 
                            loading={loading}
                          />
                        </Modal>

                        <button 
                          className="btn btn-xs bg-transparent border border-0 hover:text-[color:red]"
                          onClick={() => handleDeleteEntry(row.id)}
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


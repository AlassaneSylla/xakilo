import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, SquarePen, Trash, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

import { getProductsPaginated, postProduct, updateProduct, deleteProduct, getLowStockProducts } from '../api/productApi';
import Modal, { type ModalHandle } from '../../../shared/components/ui/Modal';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';
import Pagination from '../../../shared/components/ui/Pagination';
import Form from '../../../shared/components/ui/Form';
import type { Product, ProductPayload } from '../types';

const CATEGORY_OPTIONS = [
  { label: 'Électronique',  value: 'electronique' },
  { label: 'Meublier',      value: 'meublier' },
  { label: 'Informatique',  value: 'informatique' },
];

const ADD_FIELDS = [
  { name: 'product_name',   label: 'Produit',         required: true },
  { name: 'category',       label: 'Catégorie',        required: true, options: CATEGORY_OPTIONS },
  { name: 'unit_price',     label: 'Prix unitaire',    type: 'number', required: true },
  { name: 'purchase_price', label: "Prix d'achat",     type: 'number', required: true },
  { name: 'alert',          label: "Seuil d'alerte",   type: 'number', required: true },
];

const EDIT_FIELDS = [
  { name: 'product_name',   label: 'Produit',       disabled: true },
  { name: 'category',       label: 'Catégorie',      disabled: true },
  { name: 'stock',          label: 'Stock',          type: 'number', disabled: true },
  { name: 'unit_price',     label: 'Prix unitaire',  type: 'number' },
  { name: 'purchase_price', label: "Prix d'achat",   type: 'number' },
  { name: 'alert',          label: "Seuil d'alerte", type: 'number' },
];

const EMPTY_ADD = { product_name: '', category: '', unit_price: 0, purchase_price: 0, alert: 0 };
const PER_PAGE = 20;

export default function ProductsPage() {
  const addModalRef  = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);

  const [products,        setProducts]        = useState<Product[]>([]);
  const [count,           setCount]           = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [lowStockCount,   setLowStockCount]   = useState(0);

  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStockOnly,    setLowStockOnly]    = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);

  const [addForm,  setAddForm]  = useState({ ...EMPTY_ADD });
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editId,   setEditId]   = useState<number | null>(null);
  const [saving,   setSaving]   = useState(false);

  const fetchProducts = useCallback(async (page: number, q: string, lowStock: boolean) => {
    setLoading(true);
    try {
      const data = await getProductsPaginated(page, q, lowStock);
      setProducts(data.results);
      setCount(data.count);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearch, lowStockOnly);
  }, [currentPage, debouncedSearch, lowStockOnly, fetchProducts]);

  useEffect(() => {
    getLowStockProducts()
      .then((r) => setLowStockCount(r.count))
      .catch(() => {});
  }, []);

  const total = Math.ceil(count / PER_PAGE);
  const CONFIRM_ID = 'delete-confirm';

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleLowStockToggle = () => {
    setLowStockOnly((v) => !v);
    setCurrentPage(1);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.unit_price <= 0 || addForm.purchase_price <= 0) {
      toast.error("Le prix unitaire et le prix d'achat doivent être supérieurs à 0.");
      return;
    }
    setSaving(true);
    try {
      await postProduct(addForm as ProductPayload);
      toast.success('Produit ajouté !');
      fetchProducts(currentPage, debouncedSearch, lowStockOnly);
      setTimeout(() => addModalRef.current?.close(), 800);
    } catch { toast.error("Erreur lors de l'ajout"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setSaving(true);
    try {
      await updateProduct(editId, editForm);
      toast.success('Produit mis à jour !');
      fetchProducts(currentPage, debouncedSearch, lowStockOnly);
      setTimeout(() => editModalRef.current?.close(), 800);
    } catch { toast.error('Échec de la mise à jour'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg flex ring-1 ring-gray-300`}>
        <div className="flex-1 p-4 flex items-center gap-3">
          <Trash />
          <p className="text-sm font-medium">Supprimer ce produit ?</p>
          <button className="btn btn-xs btn-error" onClick={() => {
            deleteProduct(id)
              .then(() => {
                toast.success('Produit supprimé !');
                fetchProducts(currentPage, debouncedSearch, lowStockOnly);
              })
              .catch(() => toast.error('Erreur'));
            toast.dismiss(CONFIRM_ID);
          }}>Oui</button>
        </div>
        <div className="flex border-l border-gray-200">
          <button onClick={() => toast.dismiss(CONFIRM_ID)} className="p-4 text-sm">Non</button>
        </div>
      </div>
    ), { id: CONFIRM_ID });
  };

  if (loading && products.length === 0) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Liste des Produits</h1>

      <div className="grid grid-cols-3 gap-6 mb-8 mt-4 items-center">
        <label className="input">
          <Search size={16} />
          <input type="search" placeholder="Rechercher par nom ou catégorie"
            value={search} onChange={(e) => handleSearchChange(e.target.value)} />
        </label>
        <Button variant="primary" size="md" onClick={() => { setAddForm({ ...EMPTY_ADD }); addModalRef.current?.open(); }}>
          <Plus /> Ajouter produit
        </Button>
        <button
          type="button"
          onClick={handleLowStockToggle}
          className={`btn btn-md font-semibold flex items-center gap-1.5 transition-all duration-200 ${
            lowStockOnly
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
              : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-500 hover:text-white hover:border-gray-500'
          }`}
        >
          <PackageX size={15} />
          Ruptures
          {lowStockCount > 0 && (
            <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${lowStockOnly ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>
              {lowStockCount}
            </span>
          )}
        </button>
        <Modal ref={addModalRef} title="AJOUTER PRODUIT">
          <Form fields={ADD_FIELDS} values={addForm} onChange={(e) => {
            const { name, value, type } = e.target as HTMLInputElement;
            setAddForm((p) => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
          }} onSubmit={handleAdd} submitLabel="Ajouter" loading={saving} />
        </Modal>
      </div>

      {search && (
        <p className="text-xs text-gray-400 mb-3">{count} résultat(s)</p>
      )}

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="bg-base-200">
              <th>Produit</th><th>Catégorie</th><th>Référence</th>
              <th>Stock</th><th>Prix unitaire</th><th>Actions</th>
            </tr>
          </thead>
          <tbody className="transition-all duration-300">
            {products.map((row) => (
              <tr key={row.id} className="hover:bg-base-200">
                <td className="capitalize">{row.product_name}</td>
                <td className="capitalize">{row.category}</td>
                <td className="text-xs">{row.product_ref}</td>
                <td className="font-bold">{row.stock}</td>
                <td>{row.unit_price}</td>
                <td className="flex gap-1 items-center">
                  <IconButton tooltip="Modifier" color="primary"
                    onClick={() => {
                      setEditId(row.id);
                      setEditForm({ product_name: row.product_name, category: row.category, stock: row.stock, unit_price: row.unit_price, purchase_price: row.purchase_price, alert: row.alert });
                      editModalRef.current?.open();
                    }}>
                    <SquarePen size={14} />
                  </IconButton>
                  <IconButton tooltip="Supprimer" color="danger" onClick={() => handleDelete(row.id)}>
                    <Trash size={14} />
                  </IconButton>
                  <Link to={`/products/${row.id}/fiche-stock`} state={{ product: row }}
                    className="btn btn-xs btn-outline border-gray-300 text-gray-600 hover:bg-base-content hover:text-base-100">
                    Voir Fiche
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">Aucun produit trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />

      <Modal ref={editModalRef} title="Modifier le produit">
        <Form fields={EDIT_FIELDS} values={editForm} onChange={(e) => {
          const { name, value, type } = e.target as HTMLInputElement;
          setEditForm((p) => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }} onSubmit={handleEdit} submitLabel="Mettre à jour" loading={saving} />
      </Modal>
    </div>
  );
}
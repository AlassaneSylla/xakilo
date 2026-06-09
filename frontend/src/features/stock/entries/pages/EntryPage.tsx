import { useEffect, useRef, useState } from 'react';
import { Search, Plus, SquarePen, Trash } from 'lucide-react';
import toast from 'react-hot-toast';

import { useEntries } from '../hooks/useEntries';
import { getProducts } from '../../../products/api/productApi';
import Modal, { type ModalHandle } from '../../../../shared/components/ui/Modal';
import Button from '../../../../shared/components/ui/Button';
import IconButton from '../../../../shared/components/ui/IconButton';
import Pagination from '../../../../shared/components/ui/Pagination';
import DateRangeFilter from '../../../../shared/components/ui/DateRangeFilter';
import Form from '../../../../shared/components/ui/Form';
import { useStockAlert } from '../../../../providers/StockAlertProvider';
import { useCashSession } from '../../../../providers/CashSessionProvider';
import type { Product } from '../../../products/types';
import type { Entry } from '../types';

function isSameDay(dateStr: string | null | undefined, filter: string): boolean {
  if (!filter || !dateStr) return false;
  return new Date(dateStr).toLocaleDateString('fr-CA') === filter;
}

export default function EntryPage() {
  const { entries, loading, create, update, remove } = useEntries();
  const [products, setProducts] = useState<Product[]>([]);
  const addModalRef  = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const [addForm,     setAddForm]     = useState<Record<string, string | number>>({ product: 0, quantity: 0, supplier: '', category: '' });
  const [editForm,    setEditForm]    = useState<Record<string, string | number>>({ product: 0, quantity: 0, supplier: '', category: '' });
  const [editId,      setEditId]      = useState<number | null>(null);
  const [saving,      setSaving]      = useState(false);
  const { refreshLowStock } = useStockAlert();
  const { ensureSession } = useCashSession();
  const [search,      setSearch]      = useState('');
  const [dateFilter,  setDateFilter]  = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);

  const productOptions = products.map((p) => ({ value: p.id, label: p.product_name }));

  const ADD_FIELDS = [
    { name: 'product',  label: 'Produit',    required: true, options: productOptions },
    { name: 'quantity', label: 'Quantité',   type: 'number', required: true },
    { name: 'supplier', label: 'Fournisseur', required: true },
    { name: 'category', label: 'Catégorie',  disabled: true, readOnly: true },
  ];

  const EDIT_FIELDS = [
    { name: 'product',  label: 'Produit',    options: productOptions, disabled: true },
    { name: 'category', label: 'Catégorie',  disabled: true },
    { name: 'quantity', label: 'Quantité',   type: 'number', required: true },
    { name: 'supplier', label: 'Fournisseur', required: true },
  ];

  const filtered = entries.filter((e: Entry) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || (e.product_name ?? '').toLowerCase().includes(q)
      || (e.supplier ?? '').toLowerCase().includes(q);
    const matchDate = !dateFilter || isSameDay(e.date_register, dateFilter);
    return matchSearch && matchDate;
  });

  const total        = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<Record<string, string | number>>>) => {
    const { name, value } = e.target;
    setter((prev) => {
      if (name === 'product') {
        const sel = products.find((p) => p.id === Number(value));
        return { ...prev, product: Number(value), category: sel?.category ?? '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const CONFIRM_ID = 'entry-delete';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await ensureSession();
    if (!ok) return;
    setSaving(true);
    try {
      await create(addForm);
      toast.success('Entrée ajoutée !');
      refreshLowStock();
      setTimeout(() => addModalRef.current?.close(), 800);
    } catch { toast.error("Erreur lors de l'ajout"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setSaving(true);
    try {
      await update(editId, editForm);
      toast.success('Entrée mise à jour !');
      setTimeout(() => editModalRef.current?.close(), 800);
    } catch { toast.error('Échec mise à jour'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg flex ring-1 ring-gray-300`}>
        <div className="flex-1 p-4 flex items-center gap-3">
          <Trash />
          <p className="text-sm font-medium">Supprimer cette entrée ?</p>
          <button className="btn btn-xs btn-error" onClick={() => {
            remove(id).then(() => toast.success('Entrée supprimée !')).catch(() => toast.error('Erreur'));
            toast.dismiss(CONFIRM_ID);
          }}>Oui</button>
        </div>
        <div className="border-l border-gray-200">
          <button className="p-4 text-sm" onClick={() => toast.dismiss(CONFIRM_ID)}>Non</button>
        </div>
      </div>
    ), { id: CONFIRM_ID });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Table des Entrées</h1>

      <div className="grid grid-cols-3 gap-6 mb-8 mt-4 items-center">
        <label className="input">
          <Search size={16} />
          <input type="search" placeholder="Rechercher par produit ou fournisseur"
            value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </label>
        <Button variant="primary" size="md" onClick={() => {
          setAddForm({ product: 0, quantity: 0, supplier: '', category: '' });
          addModalRef.current?.open();
        }}>
          <Plus /> Ajouter une entrée
        </Button>
        <Modal ref={addModalRef} title="AJOUTER UNE ENTRÉE">
          <Form fields={ADD_FIELDS} values={addForm}
            onChange={(e) => handleChange(e, setAddForm)}
            onSubmit={handleAdd} submitLabel="Ajouter" loading={saving} />
        </Modal>
        <DateRangeFilter value={dateFilter} onChange={(d) => { setDateFilter(d); setCurrentPage(1); }} />
      </div>

      {(search || dateFilter) && (
        <p className="text-xs text-gray-400 mb-3">{filtered.length} résultat(s)</p>
      )}

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="bg-base-200">
              <th>🏷️ Produit</th><th>📂 Catégorie</th><th>🔢 Référence</th>
              <th>📅 Date</th><th>📦 Quantité</th><th>🚚 Fournisseur</th><th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row) => (
              <tr key={row.id} className="hover:bg-base-200">
                <th className="font-semibold">{row.product_name}</th>
                <td>{row.category}</td>
                <td className="text-xs">{row.entry_reference}</td>
                <td>{new Date(row.date_register).toLocaleDateString('fr-FR')}</td>
                <td className="text-green-700">{row.quantity}</td>
                <td>{row.supplier}</td>
                <td className="flex gap-1 items-center">
                  <IconButton tooltip="Modifier" color="primary" onClick={() => {
                    setEditId(row.id);
                    setEditForm({ product: row.product, quantity: row.quantity, supplier: row.supplier, category: row.category });
                    editModalRef.current?.open();
                  }}><SquarePen size={14} /></IconButton>
                  <Modal ref={editModalRef} title="Modifier l'entrée">
                    <Form fields={EDIT_FIELDS} values={editForm}
                      onChange={(e) => handleChange(e, setEditForm)}
                      onSubmit={handleEdit} submitLabel="Mettre à jour" loading={saving} />
                  </Modal>
                  <IconButton tooltip="Supprimer" color="danger" onClick={() => handleDelete(row.id)}>
                    <Trash size={14} />
                  </IconButton>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">Aucune entrée trouvée.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />
    </div>
  );
}
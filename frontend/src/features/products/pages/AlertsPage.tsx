import { useEffect, useState } from 'react';
import { getProductsPaginated } from '../api/productApi';
import type { Product } from '../types';

export default function AlertsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProductsPaginated(1, '', true)
      .then(({ results }) => setProducts(results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-(--primary)" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Produits en alerte de rupture</h1>
      <ul className="bg-base-100 rounded-box shadow-md divide-y divide-gray-200">
        {products.length > 0 ? products.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-3 hover:bg-base-200 transition-all">
            <div className="flex flex-col w-1/4">
              <span className="font-semibold text-sm">{p.product_name}</span>
              <span className="text-xs opacity-60">{p.category}</span>
            </div>
            <div className="flex flex-col w-[10%]">
              <span className="text-xs font-semibold text-red-500">Stock : {p.stock}</span>
              <span className="text-xs opacity-60">Seuil : {p.alert}</span>
            </div>
            <div className="flex flex-col text-sm w-1/4">
              <span className="opacity-60">Fournisseur :</span>
              <span className="font-semibold">{p.last_supplier ?? '—'}</span>
              {p.last_entry_date && (
                <span className="text-xs opacity-60">{new Date(p.last_entry_date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex flex-col text-xs w-[10%]">
              <span className="opacity-60">Référence</span>
              <span className="font-semibold">{p.product_ref}</span>
            </div>
            <div className="flex flex-col text-xs text-right w-1/6">
              <span className="font-semibold">Vente : {p.unit_price ?? '—'} F</span>
              <span className="opacity-60">Achat : {p.purchase_price ?? '—'}</span>
            </div>
            <div className="flex flex-col text-xs text-right w-[10%]">
              <span className="opacity-60">Ajouté par</span>
              <span className="text-(--primary) font-semibold">{p.created_by_username}</span>
            </div>
          </li>
        )) : (
          <li className="p-4 text-center text-gray-500">Aucun produit en alerte</li>
        )}
      </ul>
    </div>
  );
}
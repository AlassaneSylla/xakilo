import { useEffect, useState } from 'react';
import { getProducts, postProduct, updateProduct, deleteProduct } from '../api/productApi';
import type { Product, ProductPayload } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setError('Erreur lors du chargement des produits'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const create = async (payload: ProductPayload) => {
    const created = await postProduct(payload);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: number, payload: Partial<ProductPayload>) => {
    const updated = await updateProduct(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const remove = async (id: number) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return { products, loading, error, create, update, remove, refresh: fetchAll };
}
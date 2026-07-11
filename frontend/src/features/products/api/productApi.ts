import { client } from '../../../shared/api/client';
import type { Product, ProductPayload } from '../types';

export type PaginatedProducts = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await client.get<Product[]>('products/');
  return data;
};

export const getProductsPaginated = async (
  page: number,
  search = '',
  lowStockOnly = false,
): Promise<PaginatedProducts> => {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  if (lowStockOnly) params.low_stock_only = 'true';
  const { data } = await client.get<PaginatedProducts>('products/', { params });
  return data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const { data } = await client.get<Product>(`products/${id}/`);
  return data;
};

export const postProduct = async (payload: ProductPayload): Promise<Product> => {
  const { data } = await client.post<Product>('products/add/', payload);
  return data;
};

export const updateProduct = async (id: number, payload: Partial<ProductPayload>): Promise<Product> => {
  const { data } = await client.patch<Product>(`products/${id}/update/`, payload);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await client.delete(`products/${id}/delete/`);
};

export const getLowStockProducts = async (): Promise<{ count: number; products: Product[] }> => {
  const { data } = await client.get('products/low-stock/');
  return data;
};
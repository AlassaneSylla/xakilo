import { client } from '../../../shared/api/client';
import type { Product, ProductPayload } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await client.get<Product[]>('products/');
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
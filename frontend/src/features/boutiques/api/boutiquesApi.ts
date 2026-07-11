import { client } from '../../../shared/api/client';
import type { User } from '../../users/types';

export type BoutiquePayload = {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  is_active?: boolean;
};

export type Boutique = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  logo: string | null;
  created_at: string;
  is_active: boolean;
  user_count: number;
  owner_id: number | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
};

export type PaginatedBoutiques = { count: number; results: Boutique[] };

export const getBoutiques = async (page = 1): Promise<PaginatedBoutiques> => {
  const { data } = await client.get<PaginatedBoutiques>(`boutiques/?page=${page}`);
  return data;
};

export const postBoutique = async (payload: BoutiquePayload): Promise<Boutique> => {
  const { data } = await client.post<Boutique>('boutiques/add/', payload);
  return data;
};

export const patchBoutique = async (id: number, payload: Partial<BoutiquePayload>): Promise<Boutique> => {
  const { data } = await client.patch<Boutique>(`boutiques/${id}/update/`, payload);
  return data;
};

export const deleteBoutique = async (id: number): Promise<void> => {
  await client.delete(`boutiques/${id}/delete/`);
};

export const getBoutiqueUsers = async (id: number): Promise<User[]> => {
  const { data } = await client.get<User[]>(`boutiques/${id}/users/`);
  return data;
};

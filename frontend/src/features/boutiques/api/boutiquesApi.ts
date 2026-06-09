import { client } from '../../../shared/api/client';

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
};

export const getBoutiques = async (): Promise<Boutique[]> => {
  const { data } = await client.get<Boutique[]>('boutiques/');
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

import { client } from '../../../shared/api/client';
import type { Boutique } from '../../boutiques/api/boutiquesApi';

export type SettingsPayload = {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
};

export const getBoutiqueSettings = async (id: number): Promise<Boutique> => {
  const { data } = await client.get<Boutique>(`boutiques/${id}/`);
  return data;
};

export const updateBoutiqueSettings = async (id: number, payload: SettingsPayload): Promise<Boutique> => {
  const { data } = await client.patch<Boutique>(`boutiques/${id}/update/`, payload);
  return data;
};

export const uploadBoutiqueLogo = async (id: number, file: File): Promise<Boutique> => {
  const fd = new FormData();
  fd.append('logo', file);
  const { data } = await client.patch<Boutique>(`boutiques/${id}/update/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

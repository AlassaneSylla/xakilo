import { client } from '../../../../shared/api/client';
import type { Entry, EntryPayload } from '../types';

export const getEntries = async (): Promise<Entry[]> => {
  const { data } = await client.get<Entry[]>('entries/');
  return data;
};

export const getEntryById = async (id: number): Promise<Entry> => {
  const { data } = await client.get<Entry>(`entries/${id}/`);
  return data;
};

export const getEntriesByProductId = async (productId: number): Promise<Entry[]> => {
  const { data } = await client.get<Entry[]>(`entries/product/${productId}/`);
  return data;
};

export const postEntry = async (payload: EntryPayload): Promise<Entry> => {
  const { data } = await client.post<Entry>('entries/add/', payload);
  return data;
};

export const updateEntry = async (id: number, payload: Partial<EntryPayload>): Promise<Entry> => {
  const { data } = await client.patch<Entry>(`entries/${id}/update/`, payload);
  return data;
};

export const deleteEntry = async (id: number): Promise<void> => {
  await client.delete(`entries/${id}/delete/`);
};
import { client } from '../../../shared/api/client';
import type { Removal } from '../../stock/removals/types';

export const getSales = async (): Promise<Removal[]> => {
  const { data } = await client.get<Removal[]>('removals/');
  return data.filter((r) => r.destination === 'vente');
};

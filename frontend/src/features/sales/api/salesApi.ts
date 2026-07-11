import { client } from '../../../shared/api/client';
import type { Removal } from '../../stock/removals/types';

export type PaginatedSales = { count: number; results: Removal[] };

export const getSales = async (page = 1, search = '', date = ''): Promise<PaginatedSales> => {
  const params: Record<string, string | number> = { page, destination: 'vente' };
  if (search) params.search = search;
  if (date)   params.date   = date;
  const { data } = await client.get<PaginatedSales>('removals/', { params });
  return data;
};
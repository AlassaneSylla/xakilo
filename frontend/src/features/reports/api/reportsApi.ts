import { client } from '../../../shared/api/client';

export type ReportPeriod = 'day' | 'month' | 'year' | 'custom';

export type ReportSection = 'materiel' | 'financier' | 'both';

export async function fetchReport(
  period: ReportPeriod,
  options?: { date_from?: string; date_to?: string; section?: ReportSection },
) {
  const params: Record<string, string> = { period };
  if (options?.section)   params.section   = options.section;
  if (period === 'custom' && options?.date_from) params.date_from = options.date_from;
  if (period === 'custom' && options?.date_to)   params.date_to   = options.date_to;
  const { data } = await client.get('users/reports/', { params });
  return data;
}
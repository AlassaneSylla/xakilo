import { useEffect, useState } from 'react';
import { fetchReport, type ReportPeriod, type ReportSection, type ReportData } from '../api/reportsApi';

export function useReports(
  period: ReportPeriod,
  options?: { date_from?: string; date_to?: string; section?: ReportSection },
) {
  const [data,    setData]    = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchReport(period, options)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, options?.date_from, options?.date_to, options?.section]);

  return { data, loading };
}

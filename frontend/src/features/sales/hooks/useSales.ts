import { useCallback, useEffect, useState } from 'react';
import { getSales } from '../api/salesApi';
import type { Removal } from '../../stock/removals/types';

export function useSales(page = 1, search = '', date = '') {
  const [sales,   setSales]   = useState<Removal[]>([]);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getSales(page, search, date)
      .then(({ results, count: c }) => { setSales(results); setCount(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { sales, count, loading, refetch: fetch };
}
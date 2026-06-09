import { useCallback, useEffect, useState } from 'react';
import { getSales } from '../api/salesApi';
import type { Removal } from '../../stock/removals/types';

export function useSales() {
  const [sales, setSales]     = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getSales()
      .then(setSales)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { sales, loading, refetch: fetch };
}

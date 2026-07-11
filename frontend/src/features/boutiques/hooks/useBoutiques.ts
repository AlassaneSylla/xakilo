import { useCallback, useEffect, useState } from 'react';
import { getBoutiques, type Boutique } from '../api/boutiquesApi';

export function useBoutiques() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [count, setCount]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback((p: number) => {
    setLoading(true);
    getBoutiques(p)
      .then(({ results, count: c }) => { setBoutiques(results); setCount(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(page); }, [page, fetch]);

  return { boutiques, loading, count, page, setPage, refetch: () => fetch(page) };
}

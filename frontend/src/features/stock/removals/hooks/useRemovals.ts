import { useCallback, useEffect, useState } from 'react';
import { getRemovals, postRemoval } from '../api/removalsApi';
import type { Removal, RemovalPayload } from '../types';

export function useRemovals(page: number, search: string, date: string) {
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  const fetchRemovals = useCallback(() => {
    setLoading(true);
    getRemovals(page, search, date)
      .then(({ results, count: c }) => { setRemovals(results); setCount(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, date]);

  useEffect(() => { fetchRemovals(); }, [fetchRemovals]);

  const create = async (payload: RemovalPayload) => {
    const created = await postRemoval(payload);
    return created;
  };

  return { removals, count, loading, create, refetch: fetchRemovals };
}

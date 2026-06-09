import { useCallback, useEffect, useState } from 'react';
import { getRemovals, postRemoval } from '../api/removalsApi';
import type { Removal, RemovalPayload } from '../types';

export function useRemovals() {
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchRemovals = useCallback(() => {
    setLoading(true);
    getRemovals()
      .then(setRemovals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRemovals(); }, [fetchRemovals]);

  const create = async (payload: RemovalPayload) => {
    const created = await postRemoval(payload);
    setRemovals((prev) => [created, ...prev]);
    return created;
  };

  return { removals, loading, create, refetch: fetchRemovals };
}
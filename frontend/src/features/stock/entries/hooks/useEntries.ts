import { useCallback, useEffect, useState } from 'react';
import { getEntries, postEntry, updateEntry, deleteEntry } from '../api/entriesApi';
import type { Entry, EntryPayload } from '../types';

export function useEntries(page: number, search: string, date: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(() => {
    setLoading(true);
    getEntries(page, search, date)
      .then(({ results, count: c }) => { setEntries(results); setCount(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, date]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const create = async (payload: EntryPayload) => {
    const created = await postEntry(payload);
    fetchEntries();
    return created;
  };

  const update = async (id: number, payload: Partial<EntryPayload>) => {
    const updated = await updateEntry(id, payload);
    fetchEntries();
    return updated;
  };

  const remove = async (id: number) => {
    await deleteEntry(id);
    fetchEntries();
  };

  return { entries, count, loading, create, update, remove };
}

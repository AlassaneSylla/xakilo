import { useEffect, useState } from 'react';
import { getEntries, postEntry, updateEntry, deleteEntry } from '../api/entriesApi';
import type { Entry, EntryPayload } from '../types';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntries()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = async (payload: EntryPayload) => {
    const created = await postEntry(payload);
    setEntries((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: number, payload: Partial<EntryPayload>) => {
    const updated = await updateEntry(id, payload);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const remove = async (id: number) => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, create, update, remove };
}
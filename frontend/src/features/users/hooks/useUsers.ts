import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '../api/usersApi';
import type { User } from '../types';

export function useUsers() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, loading, refetch: fetch };
}

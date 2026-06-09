import { useCallback, useEffect, useState } from 'react';
import { getBoutiques, type Boutique } from '../api/boutiquesApi';

export function useBoutiques() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getBoutiques()
      .then(setBoutiques)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { boutiques, loading, refetch: fetch };
}

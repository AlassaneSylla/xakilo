import { useEffect, useState } from 'react';
import { getInvoices } from '../api/invoicesApi';
import type { Removal } from '../../stock/removals/types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Removal[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { invoices, loading };
}
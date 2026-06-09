import type { Removal } from '../../stock/removals/types';

export function calculateTotals(removals: Removal[]) {
  const now = new Date();
  const sales = removals.filter((r) => r.destination === 'vente' && r.invoice);

  const todaySales = sales.filter((r) => {
    if (!r.invoice?.date_created) return false;
    return new Date(r.invoice.date_created).toDateString() === now.toDateString();
  });

  const totalToday = todaySales.reduce((sum, r) => sum + (r.invoice?.total_amount ?? 0), 0);

  const totalMonth = sales
    .filter((r) => {
      if (!r.invoice?.date_created) return false;
      const d = new Date(r.invoice.date_created);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + (r.invoice?.total_amount ?? 0), 0);

  return { totalToday, totalMonth, numberOfInvoicesToday: todaySales.length };
}
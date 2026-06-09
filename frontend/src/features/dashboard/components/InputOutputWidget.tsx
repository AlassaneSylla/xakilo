import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import type { RecentTransaction } from '../hooks/useDashboard';

const DEST_LABEL: Record<string, string> = {
  vente: 'Vente',
  don:   'Don',
  perte: 'Perte',
};

export default function InputOutputWidget({ transactions }: { transactions: RecentTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4">Aucune transaction enregistrée.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200 text-xs uppercase tracking-wide text-gray-500">
            <th>Type</th>
            <th>Produit</th>
            <th>Qté</th>
            <th>Utilisateur</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-base-100 text-sm">
              <td>
                {t.type === 'entry' ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ArrowDownToLine size={13} /> Entrée
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-500 font-medium">
                    <ArrowUpFromLine size={13} />
                    {DEST_LABEL[t.destination ?? ''] ?? 'Sortie'}
                  </span>
                )}
              </td>
              <td className={`font-medium truncate max-w-35 ${t.destination === 'perte' ? 'text-red-500' : ''}`}>
                {t.product}
              </td>
              <td>{t.quantity}</td>
              <td className="text-gray-500 text-xs capitalize">{t.user}</td>
              <td className="text-gray-400 text-xs whitespace-nowrap">
                {new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
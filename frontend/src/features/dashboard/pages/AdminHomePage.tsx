import { Store, Users, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { useBoutiques } from '../../boutiques/hooks/useBoutiques';

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="card bg-base-200 shadow border border-base-300">
      <div className="card-body flex-row items-center gap-4 py-5">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const { boutiques, loading } = useBoutiques();

  const totalBoutiques  = boutiques.length;
  const activeBoutiques = boutiques.filter((b) => b.is_active).length;
  const inactiveBoutiques = totalBoutiques - activeBoutiques;
  const totalUsers      = boutiques.reduce((sum, b) => sum + b.user_count, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-(--primary)" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-1">Tableau de bord administrateur</h1>
      <p className="text-sm text-gray-400 mb-8">Vue globale de la plateforme Xakilo</p>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon={<Building2 size={22} className="text-white" />}
          label="Boutiques enregistrées"
          value={totalBoutiques}
          color="bg-[var(--primary)]"
        />
        <StatCard
          icon={<CheckCircle size={22} className="text-white" />}
          label="Boutiques actives"
          value={activeBoutiques}
          color="bg-green-500"
        />
        <StatCard
          icon={<XCircle size={22} className="text-white" />}
          label="Boutiques inactives"
          value={inactiveBoutiques}
          color="bg-red-500"
        />
        <StatCard
          icon={<Users size={22} className="text-white" />}
          label="Utilisateurs au total"
          value={totalUsers}
          color="bg-blue-500"
        />
      </div>

      {/* Boutiques list summary */}
      <h2 className="text-lg font-semibold mb-4">Aperçu des boutiques</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Propriétaire</th>
              <th>Utilisateurs</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {boutiques.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <Store size={14} className="text-(--primary)" />
                    <span className="font-medium">{b.name}</span>
                  </div>
                  {b.email && <p className="text-xs text-gray-400">{b.email}</p>}
                </td>
                <td>
                  {b.owner_name ? (
                    <div>
                      <p className="text-sm font-medium">{b.owner_name}</p>
                      {b.owner_phone && <p className="text-xs text-gray-400">{b.owner_phone}</p>}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-ghost badge-sm">{b.user_count} / 5</span>
                </td>
                <td>
                  <span className={`badge badge-sm ${b.is_active ? 'badge-success' : 'badge-error'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {boutiques.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-8">
                  Aucune boutique enregistrée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

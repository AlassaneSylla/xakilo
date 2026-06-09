import { useState } from 'react';
import { Save, Store } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { client } from '../../../shared/api/client';
import Button from '../../../shared/components/ui/Button';
import toast from 'react-hot-toast';

export default function ParametersPage() {
  const { user } = useAuth();
  const [name, setName]       = useState(user?.boutique_name ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.boutique) return;
    setLoading(true);
    try {
      await client.patch(`boutiques/${user.boutique}/update/`, { name });
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-8">Paramètres de la boutique</h1>

      <div className="card bg-base-200 shadow-md max-w-lg">
        <div className="card-body">
          <h2 className="text-lg font-bold flex items-center gap-2"><Store size={18} /> Informations</h2>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nom de la boutique
              </label>
              <input
                type="text"
                className="input w-full mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Propriétaire
              </label>
              <input
                type="text"
                className="input w-full mt-1 opacity-60 cursor-not-allowed"
                value={`${user?.first_name} ${user?.last_name}`}
                readOnly
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                className="input w-full mt-1 opacity-60 cursor-not-allowed"
                value={user?.email ?? ''}
                readOnly
              />
            </div>

            <Button variant="dark" size="md" type="submit" loading={loading} className="w-full mt-2">
              <Save size={16} /> Sauvegarder
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
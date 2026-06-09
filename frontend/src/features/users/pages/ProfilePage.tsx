import { useState } from 'react';
import { User, Shield, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../../providers/AuthProvider';
import { updateUser } from '../api/usersApi';
import { getRoleLabel } from '../../../shared/utils/getRoleLabel';
import Button from '../../../shared/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuth();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving,          setSaving]          = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.id, { password: newPassword });
      toast.success('Mot de passe mis à jour avec succès.');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const roleBadge =
    user.role === 'OWNER'   ? 'badge-warning' :
    user.role === 'MANAGER' ? 'badge-info'    : 'badge-ghost';

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-8">Mon profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Infos */}
        <div className="card bg-base-200 shadow lg:col-span-2">
          <div className="card-body">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <User size={16} /> Informations du compte
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prénom</p>
                <p className="mt-1 capitalize font-medium">{user.first_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nom</p>
                <p className="mt-1 capitalize font-medium">{user.last_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nom d'utilisateur</p>
                <p className="mt-1 font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                <p className="mt-1 font-medium">{user.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rôle</p>
                <span className={`badge badge-sm mt-1 ${roleBadge}`}>
                  {getRoleLabel(user)}
                </span>
              </div>
              {user.boutique_name && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Boutique</p>
                  <p className="mt-1 font-medium">{user.boutique_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Shield size={16} /> Sécurité
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <KeyRound size={11} className="inline mr-1" />
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full mt-1"
                  placeholder="Min. 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  className={`input input-bordered w-full mt-1 ${
                    confirmPassword && confirmPassword !== newPassword ? 'input-error' : ''
                  }`}
                  placeholder="Répéter le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>
              <Button
                variant="dark"
                size="md"
                type="submit"
                loading={saving}
                className="w-full"
              >
                Mettre à jour
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
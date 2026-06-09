import { useState } from 'react';
import { Shield, User, KeyRound, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../../providers/AuthProvider';
import { updateUser } from '../api/usersApi';
import Button from '../../../shared/components/ui/Button';

const PRIVILEGES = [
  'Créer, modifier et supprimer des boutiques',
  'Gérer les propriétaires et les mots de passe',
  'Accéder à toutes les boutiques de la plateforme',
  'Activer / désactiver des boutiques',
  'Visualiser les statistiques globales',
  'Gérer les utilisateurs de toutes les boutiques',
];

export default function AdminProfilePage() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-1">Mon profil</h1>
      <p className="text-sm text-gray-400 mb-8">Compte administrateur système — Xakilo</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne gauche : identité + privilèges */}
        <div className="lg:col-span-2 space-y-5">

          {/* Badge Super Admin */}
          <div className="card bg-[var(--black)] text-[var(--brokenWhite)] shadow">
            <div className="card-body py-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/10">
                  <Shield size={30} className="text-[var(--secondary)]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    Niveau d'accès
                  </p>
                  <p className="text-xl font-bold text-[var(--secondary)]">Super Administrateur</p>
                  <p className="text-xs text-gray-400 mt-0.5">Accès complet à la plateforme Xakilo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du compte */}
          <div className="card bg-base-200 shadow border border-base-300">
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
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</p>
                  <span className="badge badge-sm badge-success mt-1">Compte actif</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</p>
                  <span className="badge badge-sm bg-[var(--black)] text-[var(--secondary)] border-0 mt-1">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privilèges */}
          <div className="card bg-base-200 shadow border border-base-300">
            <div className="card-body">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Privilèges &amp; Accès
              </h2>
              <ul className="space-y-2.5">
                {PRIVILEGES.map((privilege) => (
                  <li key={privilege} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Colonne droite : sécurité */}
        <div className="card bg-base-200 shadow border border-base-300 h-fit">
          <div className="card-body">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Lock size={16} /> Sécurité
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

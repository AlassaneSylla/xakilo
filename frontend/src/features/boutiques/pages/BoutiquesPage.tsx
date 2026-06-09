import { useState } from 'react';
import { Plus, SquarePen, Trash, Store, Users, X, User, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import { useBoutiques } from '../hooks/useBoutiques';
import { postBoutique, patchBoutique, deleteBoutique, type Boutique, type BoutiquePayload } from '../api/boutiquesApi';
import { postUser, updateUser } from '../../users/api/usersApi';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';

type OwnerForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
};

const EMPTY_BOUTIQUE: BoutiquePayload = { name: '', phone: '', address: '', email: '' };
const EMPTY_OWNER: OwnerForm = { first_name: '', last_name: '', phone: '', email: '', username: '', password: '' };

type ModalMode = 'add' | 'edit';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function BoutiquesPage() {
  const { boutiques, loading, refetch } = useBoutiques();
  const [mode, setMode]                 = useState<ModalMode>('add');
  const [showModal, setShowModal]       = useState(false);
  const [selected, setSelected]         = useState<Boutique | null>(null);
  const [form, setForm]                 = useState<BoutiquePayload>(EMPTY_BOUTIQUE);
  const [owner, setOwner]               = useState<OwnerForm>(EMPTY_OWNER);
  const [ownerNewPassword, setOwnerNewPassword] = useState('');
  const [saving, setSaving]             = useState(false);

  const bf = (k: keyof BoutiquePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const of = (k: keyof OwnerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOwner((p) => ({ ...p, [k]: e.target.value }));

  const openAdd = () => {
    setMode('add');
    setForm(EMPTY_BOUTIQUE);
    setOwner(EMPTY_OWNER);
    setOwnerNewPassword('');
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (b: Boutique) => {
    setMode('edit');
    setSelected(b);
    setForm({ name: b.name, phone: b.phone ?? '', address: b.address ?? '', email: b.email ?? '' });
    setOwner(EMPTY_OWNER);
    setOwnerNewPassword('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setForm(EMPTY_BOUTIQUE);
    setOwner(EMPTY_OWNER);
    setOwnerNewPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation stricte : le propriétaire est obligatoire à la création
    if (mode === 'add') {
      const missing = !owner.first_name || !owner.last_name || !owner.email || !owner.username || !owner.password;
      if (missing) {
        toast.error('Tous les champs du propriétaire sont obligatoires.');
        return;
      }
    }

    setSaving(true);
    try {
      if (mode === 'add') {
        const boutique = await postBoutique(form);
        await postUser({
          ...owner,
          role: 'OWNER',
          boutique: boutique.id,
        });
        toast.success('Boutique créée avec son propriétaire');
      } else if (selected) {
        await patchBoutique(selected.id, form);

        // Mise à jour du mot de passe propriétaire si renseigné
        if (ownerNewPassword && selected.owner_id) {
          await updateUser(selected.owner_id, { password: ownerNewPassword });
          toast.success('Mot de passe propriétaire mis à jour');
        }

        toast.success('Boutique mise à jour');
      }
      closeModal();
      refetch();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (b: Boutique) => {
    const action = b.is_active ? 'désactiver' : 'activer';
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} la boutique ?`,
      text: `"${b.name}" sera ${b.is_active ? 'suspendue et ses utilisateurs bloqués' : 'réactivée'}.`,
      icon: b.is_active ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelButtonText: 'Annuler',
      confirmButtonColor: b.is_active ? '#ef4444' : '#22c55e',
    });
    if (!result.isConfirmed) return;
    try {
      await patchBoutique(b.id, { is_active: !b.is_active });
      toast.success(`Boutique ${b.is_active ? 'désactivée' : 'activée'}`);
      refetch();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (b: Boutique) => {
    const result = await Swal.fire({
      title: 'Supprimer la boutique ?',
      text: `"${b.name}" et tous ses utilisateurs seront définitivement supprimés.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteBoutique(b.id);
      toast.success('Boutique supprimée');
      refetch();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-2">Gestion des Boutiques</h1>
      <p className="text-sm text-gray-400 mb-8">
        Accès Super Administrateur — {boutiques.length} boutique(s) enregistrée(s)
      </p>

      <div className="flex justify-end mb-6">
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus size={16} /> Nouvelle boutique
        </Button>
      </div>

      {/* Grille des boutiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {boutiques.map((b) => (
          <div key={b.id} className={`card bg-base-200 shadow border ${b.is_active ? 'border-base-300' : 'border-red-200 opacity-60'}`}>
            <div className="card-body gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-[var(--primary)]" />
                  <h2 className="font-bold text-base">{b.name}</h2>
                </div>
                <div className="flex gap-1">
                  <IconButton
                    tooltip={b.is_active ? 'Désactiver' : 'Activer'}
                    color={b.is_active ? 'danger' : 'primary'}
                    onClick={() => handleToggleActive(b)}
                  >
                    {b.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </IconButton>
                  <IconButton tooltip="Modifier" color="primary" onClick={() => openEdit(b)}>
                    <SquarePen size={14} />
                  </IconButton>
                  <IconButton tooltip="Supprimer" color="danger" onClick={() => handleDelete(b)}>
                    <Trash size={14} />
                  </IconButton>
                </div>
              </div>

              {/* Infos boutique */}
              <div className="text-sm space-y-1 text-gray-500">
                {b.phone   && <p>📞 <span className="font-medium text-gray-700">{b.phone}</span></p>}
                {b.address && <p>📍 {b.address}</p>}
                {b.email   && <p>✉️ {b.email}</p>}
              </div>

              {/* Section propriétaire */}
              <div className="border-t border-base-300 pt-2 mt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Propriétaire</p>
                {b.owner_name ? (
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold text-gray-800">👤 {b.owner_name}</p>
                    {b.owner_phone && <p className="text-gray-500">📱 {b.owner_phone}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Aucun propriétaire assigné</p>
                )}
              </div>

              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Users size={12} />
                <span>{b.user_count} utilisateur(s)</span>
                <span className={`ml-auto badge badge-xs ${b.is_active ? 'badge-success' : 'badge-error'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {boutiques.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Store size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune boutique enregistrée.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">
                {mode === 'add' ? 'Nouvelle boutique' : `Modifier — ${selected?.name}`}
              </h3>
              <button onClick={closeModal} className="btn btn-ghost btn-xs btn-circle">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Section boutique ── */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-base-300">
                  <Store size={15} className="text-[var(--primary)]" />
                  <span className="font-semibold text-sm">Informations de la boutique</span>
                </div>
                <div className="space-y-3">
                  <Field label="Nom de la boutique *">
                    <input className="input w-full" value={form.name} onChange={bf('name')}
                      placeholder="Ex: Boutique Centrale Dakar" required />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Téléphone boutique">
                      <input className="input w-full" value={form.phone} onChange={bf('phone')}
                        placeholder="+221 33 000 00 00" />
                    </Field>
                    <Field label="Email boutique">
                      <input type="email" className="input w-full" value={form.email} onChange={bf('email')}
                        placeholder="contact@boutique.sn" />
                    </Field>
                  </div>
                  <Field label="Adresse">
                    <input className="input w-full" value={form.address} onChange={bf('address')}
                      placeholder="Rue 10, Médina, Dakar" />
                  </Field>
                </div>
              </div>

              {/* ── Section propriétaire (ajout) ── */}
              {mode === 'add' && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-base-300">
                    <User size={15} className="text-[var(--primary)]" />
                    <span className="font-semibold text-sm">Propriétaire</span>
                    <span className="text-xs text-red-500 ml-1 font-medium">— obligatoire</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Prénom *">
                        <input className="input w-full" value={owner.first_name} onChange={of('first_name')}
                          placeholder="Alassane" />
                      </Field>
                      <Field label="Nom *">
                        <input className="input w-full" value={owner.last_name} onChange={of('last_name')}
                          placeholder="Sylla" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Téléphone propriétaire">
                        <input className="input w-full" value={owner.phone} onChange={of('phone')}
                          placeholder="+221 77 000 00 00" />
                      </Field>
                      <Field label="Email (connexion) *">
                        <input type="email" className="input w-full" value={owner.email} onChange={of('email')}
                          placeholder="owner@boutique.sn" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nom d'utilisateur *">
                        <input className="input w-full" value={owner.username} onChange={of('username')}
                          placeholder="a.sylla" />
                      </Field>
                      <Field label="Mot de passe *">
                        <input type="password" className="input w-full" value={owner.password} onChange={of('password')}
                          placeholder="••••••••" />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Section propriétaire (édition) ── */}
              {mode === 'edit' && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-base-300">
                    <KeyRound size={15} className="text-[var(--primary)]" />
                    <span className="font-semibold text-sm">Propriétaire</span>
                  </div>
                  {selected?.owner_name ? (
                    <div className="space-y-3">
                      <div className="bg-base-300 rounded-lg px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-700">👤 {selected.owner_name}</p>
                        {selected.owner_phone && (
                          <p className="text-gray-500 text-xs mt-0.5">📱 {selected.owner_phone}</p>
                        )}
                      </div>
                      <Field label="Nouveau mot de passe (laisser vide pour ne pas changer)">
                        <input
                          type="password"
                          className="input w-full"
                          value={ownerNewPassword}
                          onChange={(e) => setOwnerNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          autoComplete="new-password"
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucun propriétaire assigné à cette boutique.</p>
                  )}
                </div>
              )}

              <div className="modal-action pt-2">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <Button variant="dark" size="md" type="submit" loading={saving}>
                  {mode === 'add' ? 'Créer la boutique' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeModal}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
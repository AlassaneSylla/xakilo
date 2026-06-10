import { useState } from 'react';
import { Search, Plus, SquarePen, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import { useUsers } from '../hooks/useUsers';
import { postUser, updateUser, deleteUser } from '../api/usersApi';
import { getRoleLabel } from '../../../shared/utils/getRoleLabel';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';
import Pagination from '../../../shared/components/ui/Pagination';
import type { User, UserPayload } from '../types';
import type { Role } from '../../auth/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'EMPLOYEE', label: 'Employé' },
  { value: 'MANAGER',  label: 'Manager' },
  { value: 'OWNER',    label: 'Propriétaire' },
];

const EMPTY: UserPayload = {
  username: '', first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE',
};

type EditForm = {
  first_name: string;
  last_name:  string;
  email:      string;
  role:       Role;
  password:   string;
};

export default function UsersPage() {
  const { users, loading, refetch } = useUsers();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState('');

  // ── Ajout ──────────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState<UserPayload>(EMPTY);
  const [saving, setSaving]   = useState(false);

  // ── Modification ────────────────────────────────────────────────────────
  const [editUser,  setEditUser]  = useState<User | null>(null);
  const [editForm,  setEditForm]  = useState<EditForm>({ first_name: '', last_name: '', email: '', role: 'EMPLOYEE', password: '' });
  const [editSaving, setEditSaving] = useState(false);

  const PER_PAGE = 5;
  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const total        = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Handlers ────────────────────────────────────────────────────────────

  const closeAdd = () => { setShowAdd(false); setForm(EMPTY); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await postUser(form);
      toast.success('Utilisateur ajouté');
      closeAdd();
      refetch();
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, password: '' });
  };

  const closeEdit = () => { setEditUser(null); };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    try {
      const payload: Partial<UserPayload> = {
        first_name: editForm.first_name,
        last_name:  editForm.last_name,
        email:      editForm.email,
        role:       editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;
      await updateUser(editUser.id, payload);
      toast.success('Utilisateur modifié');
      closeEdit();
      refetch();
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      text:  `${user.first_name} ${user.last_name} sera supprimé définitivement.`,
      icon:  'warning',
      showCancelButton:    true,
      confirmButtonColor:  '#ef4444',
      cancelButtonText:    'Annuler',
      confirmButtonText:   'Supprimer',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteUser(user.id);
      toast.success('Utilisateur supprimé');
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
      <h1 className="text-2xl font-bold uppercase">Utilisateurs</h1>

      <div className="grid grid-cols-3 gap-10 mb-8">
        <label className="input">
          <Search />
          <input
            type="search"
            placeholder="Rechercher"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>
        <Button variant="primary" size="md" onClick={() => setShowAdd(true)}>
          <Plus /> Ajouter utilisateur
        </Button>
        <div />
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="bg-base-200 text-[var(--black)]">
              <th>Prénom</th><th>Nom</th><th>Email</th>
              <th>Rôle</th><th>Dernière connexion</th><th>Inscription</th><th>Actions</th>
            </tr>
          </thead>
          <tbody className="transition-all duration-300">
            {currentItems.map((row) => (
              <tr key={row.id} className="hover:bg-base-200">
                <td className="capitalize">{row.first_name}</td>
                <td className="capitalize">{row.last_name}</td>
                <td>{row.email}</td>
                <td>
                  <span className={`badge badge-sm ${
                    row.role === 'OWNER'   ? 'badge-warning' :
                    row.role === 'MANAGER' ? 'badge-info'    : 'badge-ghost'
                  }`}>
                    {getRoleLabel(row)}
                  </span>
                </td>
                <td>{row.last_login ? new Date(row.last_login).toLocaleString('fr-FR') : 'Jamais'}</td>
                <td>{row.date_joined ? new Date(row.date_joined).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="flex gap-1 items-center">
                  <IconButton tooltip="Modifier" color="primary" onClick={() => openEdit(row)}>
                    <SquarePen size={14} />
                  </IconButton>
                  <IconButton tooltip="Supprimer" color="danger" onClick={() => handleDelete(row)}>
                    <Trash size={14} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} total={total} onChange={setCurrentPage} />

      {/* ── Modal Ajouter ─────────────────────────────────────────────── */}
      {showAdd && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Ajouter un utilisateur</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prénom</label>
                  <input className="input w-full mt-1" value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
                  <input className="input w-full mt-1" value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom d'utilisateur</label>
                <input className="input w-full mt-1" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" className="input w-full mt-1" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe</label>
                <input type="password" className="input w-full mt-1" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</label>
                <select className="select w-full mt-1" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal-action mt-4">
                <button type="button" className="btn btn-ghost" onClick={closeAdd}>Annuler</button>
                <Button variant="primary" size="md" type="submit" loading={saving}>Ajouter</Button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeAdd}><button>close</button></form>
        </dialog>
      )}

      {/* ── Modal Modifier ────────────────────────────────────────────── */}
      {editUser && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-1">Modifier l'utilisateur</h3>
            <p className="text-xs text-gray-400 mb-4">
              {editUser.first_name} {editUser.last_name} · {editUser.email}
            </p>
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prénom</label>
                  <input className="input w-full mt-1" value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
                  <input className="input w-full mt-1" value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" className="input w-full mt-1" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</label>
                <select className="select w-full mt-1" value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nouveau mot de passe <span className="text-gray-400 normal-case">(laisser vide pour ne pas changer)</span>
                </label>
                <input type="password" className="input w-full mt-1" value={editForm.password}
                  placeholder="••••••••"
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
              </div>
              <div className="modal-action mt-4">
                <button type="button" className="btn btn-ghost" onClick={closeEdit}>Annuler</button>
                <Button variant="primary" size="md" type="submit" loading={editSaving}>Enregistrer</Button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeEdit}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
}
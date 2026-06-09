import { useEffect, useRef, useState } from 'react';
import { Save, Upload, Store, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../../providers/AuthProvider';
import { getBoutiqueSettings, updateBoutiqueSettings, uploadBoutiqueLogo } from '../api/settingsApi';
import Button from '../../../shared/components/ui/Button';
import type { Boutique } from '../../boutiques/api/boutiquesApi';

export default function SettingsPage() {
  const { user } = useAuth();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [boutique, setBoutique]   = useState<Boutique | null>(null);
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [email, setEmail]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.boutique) return;
    getBoutiqueSettings(user.boutique).then((b) => {
      setBoutique(b);
      setName(b.name ?? '');
      setPhone(b.phone ?? '');
      setAddress(b.address ?? '');
      setEmail(b.email ?? '');
    }).catch(() => toast.error('Impossible de charger les paramètres'));
  }, [user?.boutique]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.boutique) return;
    setSaving(true);
    try {
      const updated = await updateBoutiqueSettings(user.boutique, { name, phone, address, email });
      setBoutique(updated);
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.boutique) return;
    setUploading(true);
    try {
      const updated = await uploadBoutiqueLogo(user.boutique, file);
      setBoutique(updated);
      toast.success('Logo mis à jour');
    } catch {
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase mb-8">Paramètres de la boutique</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Logo */}
        <div className="card bg-base-200 shadow">
          <div className="card-body items-center text-center gap-4">
            <h2 className="font-bold flex items-center gap-2"><Store size={16} /> Logo & Identité</h2>
            <div className="relative">
              {boutique?.logo ? (
                <img src={boutique.logo} alt="Logo boutique"
                  className="w-28 h-28 rounded-xl object-contain border border-base-300 bg-white p-2" />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-base-300 flex items-center justify-center">
                  <Store size={36} className="opacity-30" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <Button variant="greyghost" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
              <Upload size={13} /> {boutique?.logo ? 'Changer le logo' : 'Ajouter un logo'}
            </Button>
            <p className="text-xs text-gray-400">PNG, JPG — max 2 Mo</p>
          </div>
        </div>

        {/* Informations */}
        <div className="card bg-base-200 shadow lg:col-span-2">
          <div className="card-body">
            <h2 className="font-bold mb-2 flex items-center gap-2"><Store size={16} /> Informations de l'établissement</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom de la boutique *</label>
                <input className="input w-full mt-1" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
                  <input className="input w-full mt-1" value={phone}
                    onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <input type="email" className="input w-full mt-1" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="contact@boutique.sn" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</label>
                <input className="input w-full mt-1" value={address}
                  onChange={(e) => setAddress(e.target.value)} placeholder="Rue 10, Médina, Dakar" />
              </div>
              <Button variant="dark" size="md" type="submit" loading={saving} className="w-full mt-2">
                <Save size={15} /> Sauvegarder les paramètres
              </Button>
            </form>
          </div>
        </div>

        {/* Propriétaire */}
        <div className="card bg-base-200 shadow lg:col-span-3">
          <div className="card-body">
            <h2 className="font-bold mb-3 flex items-center gap-2"><User size={16} /> Mon profil (Propriétaire)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prénom</p>
                <p className="mt-1 capitalize">{user?.first_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nom</p>
                <p className="mt-1 capitalize">{user?.last_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                <p className="mt-1">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rôle</p>
                <p className="mt-1">
                  <span className="badge badge-warning badge-sm">Propriétaire</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

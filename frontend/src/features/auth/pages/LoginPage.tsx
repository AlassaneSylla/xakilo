import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { login as loginApi } from '../api/authApi';
import { useAuth } from '../../../providers/AuthProvider';
import { PATHS } from '../../../router/paths';
import LoginWelcomeOverlay from '../../../layout/LoginWelcomeOverlay';
import Button from '../../../shared/components/ui/Button';
import logo from '../../../assets/xakilo.png';

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [welcomeName,  setWelcomeName]  = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await loginApi({ username: email, password });
      const me     = await login(tokens.access, tokens.refresh);
      setWelcomeName(me.first_name || me.username);
      const destination = me.is_superuser ? PATHS.ADMIN_HOME : PATHS.HOME;
      setTimeout(() => navigate(destination), 2200);
    } catch {
      toast.error('Identifiant ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {welcomeName && <LoginWelcomeOverlay name={welcomeName} />}
      </AnimatePresence>

      <div className="min-h-screen flex">

        {/* ── Panneau gauche — branding ───────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 bg-(--black) flex-col items-center justify-center p-14 relative overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

          <img src={logo} alt="Xakilo" className="w-56 object-contain relative z-10" />

          <p className="text-(--brokenWhite) text-center mt-6 text-sm max-w-xs relative z-10 leading-relaxed opacity-60">
            Votre solution de gestion des stocks et ventes en toute simplicité
          </p>

          <div className="mt-14 flex gap-3 relative z-10">
            {['Stocks', 'Ventes', 'Rapports'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-white/15 text-[10px] font-semibold uppercase tracking-widest text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Panneau droit — formulaire ──────────────────────────────── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-base-100 px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Logo visible uniquement sur mobile */}
            <div className="lg:hidden mb-10 text-center">
              <img src={logo} alt="Xakilo" className="w-36 mx-auto object-contain" />
            </div>

            <h2 className="text-2xl font-bold mb-1">Connexion</h2>
            <p className="text-sm text-gray-400 mb-8">Accédez à votre espace de gestion</p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    className="input input-bordered w-full pl-9"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pl-9 pr-10"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button variant="dark" size="md" type="submit" loading={loading} className="w-full">
                Se connecter
              </Button>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { login as loginApi } from '../api/authApi';
import { useAuth } from '../../../providers/AuthProvider';
import { PATHS } from '../../../router/paths';
import LoginWelcomeOverlay from '../../../layout/LoginWelcomeOverlay';
import Button from '../../../shared/components/ui/Button';
import logo from '../../../assets/xakilo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await loginApi({ username: email, password });
      const me = await login(tokens.access, tokens.refresh);
      const name = me.first_name || me.username;
      setWelcomeName(name);
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

      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse justify-center items-center gap-8">
          <div className="text-center lg:text-left lg:max-w-lg">
            <img
              src={logo}
              alt="logo Xakilo"
              className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-auto mx-auto lg:mx-0 object-contain"
            />
            <p className="text-gray-700 mt-2">Votre gestion simplifiée des stocks et ventes</p>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-5">
              <legend className="fieldset-legend">Connexion</legend>

              <label className="label">Adresse email</label>
              <input
                type="email"
                className="input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label">Mot de passe</label>
              <input
                type="password"
                className="input"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <p className="mt-2 text-sm cursor-pointer hover:underline">Mot de passe oublié ?</p>

              <Button variant="dark" size="md" type="submit" loading={loading} className="w-full mt-4">
                Se connecter
              </Button>
            </fieldset>
          </form>
        </div>
      </div>
    </>
  );
}
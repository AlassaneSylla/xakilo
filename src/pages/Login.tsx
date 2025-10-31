import { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { login as loginApi } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import logo from '../assets/xakilo.png'

// export interface LoginProps {
//   onLogin: () => void;
// }

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi(username, password);
      login(data.access);

      localStorage.setItem('refreshToken', data.refresh)
      toast.success("Connexion réussie");
      navigate("/");
    } 
    catch (error: any) {
      console.error();
      setError('Utilisateur ou mot de passe incorrect');
      toast.error("Erreur de connexion");
    }
    finally {
      setLoading(false);
    }
    console.log({error})
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse justify-center items-center gap-8">
    
            <div className="text-center lg:text-left lg:max-w-lg">
                <div className="">
                  <img
                    src={logo}
                    alt="logo Xakilo"
                    className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-auto mx-auto lg:mx-0 object-contain"
                  />
                </div>
                <p className="text-gray-700 mt-0 lg:mt-0">
                  Votre gestion simplifiée des stocks et ventes
                </p>
            </div>
            <div>
              <form onSubmit={handleSubmit}>
                <fieldset 
                  className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-5">
                  <legend className="fieldset-legend">Connexion</legend>

                  <label className="label">Email</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <label className="label">Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Mot de passe" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className='mt-2'>Mot de pass oublié</p>

                  <button 
                    className="btn mt-4 bg-[var(--black)] text-[var(--brokenWhite)]" 
                    type='submit' 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm text-[var(--primary)]"></span>
                    ) : (
                      "Se connecter"
                    )}
                  </button>
                </fieldset>
              </form>
            </div>
        </div>
    </div>
  );
};

export default Login;

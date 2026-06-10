import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

import { useAuth } from '../providers/AuthProvider';
import { useStockAlert } from '../providers/StockAlertProvider';
import { PATHS } from '../router/paths';
import LogoutOverlay from './LogoutOverlay';
import logo from '../assets/xakilo_sm.png';
import userIcon from '../assets/circle-user-round.svg';

const DAYS    = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function formatDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Header() {
  const { user, logout }            = useAuth();
  const { lowStockCount }           = useStockAlert();
  const navigate                    = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      try { await logout(); } catch { /* ignore */ }
      navigate(PATHS.LOGIN);
    }, 1500);
  };

  const firstName = user?.first_name || user?.username || '';

  return (
    <>
      {isLoggingOut && <LogoutOverlay />}

      <header className="h-16 shadow-sm bg-base-100 flex items-center px-6 gap-4 relative">

        {/* Logo */}
        <Link to={user?.is_superuser ? PATHS.ADMIN_HOME : PATHS.HOME} className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Logo Xakilo" className="w-9 object-contain" />
          <span className="text-lg font-bold text-(--primary) hidden sm:block">Xakilo</span>
        </Link>

        <div className="w-px h-8 bg-base-300 shrink-0" />

        {/* Salutation */}
        <div className="flex flex-col leading-tight flex-1">
          <span className="text-sm font-semibold text-(--black)">
            Bonjour, <span className="text-(--primary)">{firstName}</span> 👋
          </span>
          <span className="text-xs text-gray-400">{formatDate()}</span>
        </div>

        {/* Nom de la boutique — centré absolument */}
        {user?.boutique_name && (
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none">
            <p className="text-sm font-bold uppercase tracking-widest text-(--black)">
              {user.boutique_name}
            </p>
          </div>
        )}

        {/* Notifications stock faible — boutique uniquement */}
        {!user?.is_superuser && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell size={20} />
                {lowStockCount > 0 && (
                  <span className="badge badge-sm indicator-item bg-red-500 text-white border-0">
                    {lowStockCount}
                  </span>
                )}
              </div>
            </div>
            <div
              tabIndex={0}
              className="card card-compact dropdown-content bg-base-200 z-10 mt-3 w-52 shadow"
            >
              <div className="card-body">
                <span className="font-bold">{lowStockCount} alerte(s) stock</span>
                <div className="card-actions">
                  <Link
                    to={PATHS.LOW_STOCK}
                    className="btn btn-xs btn-outline hover:text-(--brokenWhite) hover:bg-(--black)"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profil */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-8 rounded-full ring ring-(--primary) ring-offset-2">
              <img alt="user" src={userIcon} />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            <li className="text-(--brokenWhite) text-center mb-1 font-semibold bg-(--black) uppercase rounded px-2 py-1 text-xs">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username ?? '—'}
            </li>
            {user?.email && (
              <li className="text-xs text-center text-gray-400 mb-1 px-2 truncate">{user.email}</li>
            )}
            {!user?.is_superuser && (
              <>
                <div className="divider my-1" />
                <li><Link to={PATHS.PROFILE}>Profil</Link></li>
              </>
            )}
            <div className="divider my-1" />
            <li>
              <a onClick={handleLogout} className="cursor-pointer text-red-500 font-medium">
                Déconnexion
              </a>
            </li>
          </ul>
        </div>

      </header>
    </>
  );
}
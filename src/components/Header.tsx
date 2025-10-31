import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserById } from '../api/usersApi'

import logo from '../assets/xakilo_sm.png'
import userIcon from '../assets/circle-user-round.svg'
import { Bell } from 'lucide-react'


function Header() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // get the id from the token
    const token = localStorage.getItem('access');
    if (!token) return;

    const paylosd = JSON.parse(atob(token.split(".")[1]));
    const id = paylosd.user_id;

    getUserById(id)
      .then((data) => setCurrentUser(data))
      .catch((error) => console.error("Error Get current user : ", error))
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 shadow-sm bg-base-100 flex items-center px-5">

      {/* logo */}
      <div className="flex flex-1 items-center space-x-2">
        <a href="/" className="flex items-center space-x-2">
          <img src={logo} alt="Logo Xakilo" className="w-10 object-contain" />
          <span className="text-xl font-bold text-[var(--primary)]">Xakilo</span>
        </a>
      </div>

      {/* --- recherche  - */}
      <div className="hidden md:block mr-5">
        <input
          type="text"
          placeholder="Rechercher"
          className="input input-bordered w-48 md:w-64"
        />
      </div>

      {/*  notification  */}
      <div className="dropdown dropdown-end mr-5">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <div className="indicator">
            <Bell size={20} />
            <span className="badge badge-sm indicator-item bg-red-500 text-white">
              8
            </span>
          </div>
        </div>
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-200 z-10 mt-3 w-38 shadow"
        >
          <div className="card-body">
            <span className="text-md font-bold">8 alertes stock</span>
            <span className="text-sm text-gray-500">alert 1</span>
            <div className="card-actions">
              <Link 
                to={`/products/`} 
                // state={{ product: row }} 
                className="btn btn-xs btn-outline hover:text-[color:var(--brokenWhite)] hover:bg-[color:var(--black)]"
              >
                Voir Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* profil user */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div 
            className="w-8 rounded-full ring ring-[var(--primary)] ring-offset-2"
          >
            <img alt="user" src={userIcon} />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-200 rounded-box z-10 mt-3 w-38 p-2 shadow"
        >
          <li className="text-[var(--brokenWhite)] text-center mb-1 font-semibold bg-[var(--black)] uppercase">
            {currentUser ? currentUser.username : "Loading..."}
          </li>
          <li><a>Profil</a></li>
          <li><a>Paramètres</a></li>
          <li><a onClick={handleLogout}>Déconnexion</a></li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
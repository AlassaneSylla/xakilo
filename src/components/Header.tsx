import logo from '../assets/xakilo_sm.png'
import user from '../assets/circle-user-round.svg'
import { Bell } from 'lucide-react'

function Header() {
    return (
      <header className="h-16 flex items-center">
        <div className="navbar bg-base-100 shadow-sm px-5">
          <div className="flex flex-1 items-center space-x-1">
            <a className="logo-xakilo" href="/">
              <img src={logo} alt="Logo Xakilo" className="w-14 object-contain" />
            </a>
            <span className="text-xl font-bold text-[var(--primary)]">Xakilo</span>
          </div>
          <div className="flex gap-4">
            <input
                type="text"
                placeholder="Rechercher"
                className="input input-bordered w-24 md:w-auto"
            />
            <div className="dropdown dropdown-end ml-30">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <Bell/>
                  <span className="badge badge-sm indicator-item bg-red-500 text-white">8</span>
                </div>
              </div>
              <div
                tabIndex={0}
                className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
              >
                <div className="card-body">
                  <span className="text-lg font-bold">8 Alerts Stocks</span>
                  <span className="text-info">alert 1</span>
                  <div className="card-actions">
                    <button className="btn btn-primary btn-block">Voir details</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="circle-user-round"
                    src={user} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li>
                  <a className="justify-between">
                    Profile
                    {/* <span className="badge">New</span> */}
                  </a>
                </li>
                <li><a>Paramétre</a></li>
                <li><a>Déconnexion</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    )
}

export default Header;
import { NavLink } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { Upload } from 'lucide-react';
import { Download } from 'lucide-react';
import { File } from 'lucide-react';
import { Users } from 'lucide-react';
import { Settings } from 'lucide-react';
import { Home } from 'lucide-react';

const sidebar = [
    { wording: "Accueil", icone: <Home/>, path: '/' },
    { wording: "Produits", icone: <Archive/>, path: '/products' },
    { wording: "Entrées stock", icone: <Upload/>, path: '/entries' },
    { wording: "Sorties stock", icone: <Download/>, path: '/removals' },
    { wording: "Fiche de stock", icone: <File/>, path: '/sheet' },
    { wording: "Utilisateurs", icone: <Users/>, path: '/users' },
    { wording: "Paramétres", icone: <Settings/>, path: '/parameters' },
]

function Sidebar() {
    return (
        <aside className="w-64 bg-[var(--black)] text-[var(--brokenWhite)] p-5 mb-1">
           <ul className="space-y-2">
                {sidebar.map((item) => (
                    <li key={item.wording}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 mb-6 font-roboto text-base cursor-pointer transition-colors duration-200 ${
                                    isActive ? "text-[color:var(--secondary)]" : "text-[var(--brokenWhite)]"
                                } hover:text-[color:var(--secondary)]`
                            }
                        >
                            {item.icone}
                            <span>{item.wording}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default Sidebar
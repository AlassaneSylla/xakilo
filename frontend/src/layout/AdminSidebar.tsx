import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store } from 'lucide-react';
import { PATHS } from '../router/paths';

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: <LayoutDashboard />, path: PATHS.ADMIN_HOME },
  { label: 'Boutiques',       icon: <Store />,           path: PATHS.BOUTIQUES },
];

export default function AdminSidebar() {
  return (
    <aside
      className="w-60 h-full bg-[var(--black)] text-[var(--brokenWhite)] p-5"
      style={{ height: 'calc(100vh - 64px - 48px - 5px)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-1">
        Super Admin
      </p>
      <ul className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.path}
              end={item.path === PATHS.ADMIN_HOME}
              className={({ isActive }) =>
                `flex items-center gap-2 mb-6 font-roboto text-base cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? 'text-[color:var(--secondary)]'
                    : 'text-[var(--brokenWhite)] hover:text-[color:var(--secondary)]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

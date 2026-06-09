import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, UserCircle } from 'lucide-react';
import { PATHS } from '../router/paths';

const PLATFORM_ITEMS = [
  { label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, path: PATHS.ADMIN_HOME },
  { label: 'Boutiques',       icon: <Store size={18} />,           path: PATHS.BOUTIQUES  },
];

const ACCOUNT_ITEMS = [
  { label: 'Mon profil', icon: <UserCircle size={18} />, path: PATHS.ADMIN_PROFILE },
];

function NavItem({ label, icon, path }: { label: string; icon: React.ReactNode; path: string }) {
  return (
    <li>
      <NavLink
        to={path}
        end={path === PATHS.ADMIN_HOME}
        className={({ isActive }) =>
          `flex items-center gap-3 px-2 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
            isActive
              ? 'text-(--secondary) bg-white/5'
              : 'text-(--brokenWhite) hover:text-(--secondary) hover:bg-white/5'
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

export default function AdminSidebar() {
  return (
    <aside
      className="w-60 h-full bg-(--black) text-(--brokenWhite) flex flex-col px-4 py-5"
      style={{ height: 'calc(100vh - 64px - 48px - 5px)' }}
    >
      {/* Section plateforme */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">
          Plateforme
        </p>
        <ul className="space-y-1">
          {PLATFORM_ITEMS.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10 mb-6" />

      {/* Section compte */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">
          Compte
        </p>
        <ul className="space-y-1">
          {ACCOUNT_ITEMS.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </ul>
      </div>

      {/* Badge Super Admin en bas */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-2 h-2 rounded-full bg-(--secondary) animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-(--secondary)">
            Super Admin
          </span>
        </div>
      </div>
    </aside>
  );
}

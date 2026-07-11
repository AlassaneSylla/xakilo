import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Upload, Download,
  ReceiptText, Users, Settings,
  BarChart3, Boxes, CircleDollarSign, ChevronDown,
  Clock, Wallet,
} from 'lucide-react';
import { PATHS } from '../router/paths';
import { usePermission } from '../shared/hooks/usePermission';
import { useCashSession } from '../providers/CashSessionProvider';

function NavItem({ icon, label, path, end = false }: {
  icon: React.ReactNode; label: string; path: string; end?: boolean;
}) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { canManageUsers, isOwner, isSuperUser } = usePermission();
  const { session, needsSession } = useCashSession();
  const location = useLocation();

  const bilanActive = location.pathname.startsWith('/reports');
  const [bilanOpen, setBilanOpen] = useState(bilanActive);

  const sessionOpen = needsSession && !!session;

  return (
    <aside
      className="w-60 bg-(--black) flex flex-col py-6 px-4 gap-1 overflow-y-auto"
      style={{ height: 'calc(100vh - 64px - 48px - 5px)' }}
    >
      <NavItem icon={<LayoutDashboard size={18} />} label="Tableau de bord" path={PATHS.HOME} end />
      <NavItem icon={<Package size={18} />} label="Produits" path={PATHS.PRODUCTS} />
      <NavItem icon={<Upload size={18} />} label="Entrées stock" path={PATHS.ENTRIES} />
      <NavItem icon={<Download size={18} />} label="Sorties stock" path={PATHS.REMOVALS} />
      <NavItem icon={<ReceiptText size={18} />} label="Ventes" path={PATHS.SALES} />
      <NavItem icon={<Wallet size={18} />} label="Dépenses" path={PATHS.EXPENSES} />

      {/* ── Session de caisse ────────────────────────────────────────── */}
      <NavLink
        to={PATHS.SESSION}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`
        }
      >
        <Clock size={18} />
        <span className="flex-1">Session</span>
        {needsSession && (
          <span className={`w-2 h-2 rounded-full shrink-0 ${sessionOpen ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        )}
      </NavLink>

      {/* ── Bilan (dropdown) ─────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setBilanOpen((v) => !v)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            bilanActive
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BarChart3 size={18} />
          <span className="flex-1 text-left">Bilan</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${bilanOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Sous-items avec animation CSS */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            bilanOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-4 pl-3 border-l border-white/10 mt-1 space-y-0.5">
            <NavLink
              to={PATHS.BILAN_MATERIEL}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Boxes size={15} />
              <span>Matériel</span>
            </NavLink>
            <NavLink
              to={PATHS.BILAN_FINANCIER}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <CircleDollarSign size={15} />
              <span>Financier</span>
            </NavLink>
          </div>
        </div>
      </div>

      {canManageUsers && (
        <NavItem icon={<Users size={18} />} label="Utilisateurs" path={PATHS.USERS} />
      )}
      {(isOwner || isSuperUser) && (
        <NavItem icon={<Settings size={18} />} label="Paramètres" path={PATHS.SETTINGS} />
      )}
    </aside>
  );
}
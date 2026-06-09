import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PATHS } from './paths';
import PrivateRoute   from './PrivateRoute';
import RequireRole    from './RequireRole';
import ErrorBoundary  from './ErrorBoundary';
import Layout         from '../layout/Layout';
import AdminLayout    from '../layout/AdminLayout';

import LoginPage       from '../features/auth/pages/LoginPage';
import HomePage        from '../features/dashboard/pages/HomePage';
import AdminHomePage   from '../features/dashboard/pages/AdminHomePage';
import ProductsPage    from '../features/products/pages/ProductsPage';
import StockSheetPage  from '../features/products/pages/StockSheetPage';
import AlertsPage      from '../features/products/pages/AlertsPage';
import EntryPage       from '../features/stock/entries/pages/EntryPage';
import RemovalPage     from '../features/stock/removals/pages/RemovalPage';
import RemovalFormPage from '../features/stock/removals/pages/RemovalFormPage';
import SalesPage            from '../features/sales/pages/SalesPage';
import BilanMaterielPage    from '../features/reports/pages/BilanMaterielPage';
import BilanFinancierPage   from '../features/reports/pages/BilanFinancierPage';
import CashSessionPage      from '../features/cash/pages/CashSessionPage';
import ExpensePage          from '../features/cash/pages/ExpensePage';
import UsersPage            from '../features/users/pages/UsersPage';
import ProfilePage     from '../features/users/pages/ProfilePage';
import SettingsPage    from '../features/settings/pages/SettingsPage';
import BoutiquesPage   from '../features/boutiques/pages/BoutiquesPage';

const router = createBrowserRouter([
  { path: PATHS.LOGIN, element: <LoginPage />, errorElement: <ErrorBoundary /> },

  {
    element: <PrivateRoute />,
    errorElement: <ErrorBoundary />,
    children: [

      // ── Super Admin interface ────────────────────────────────────────────────
      {
        element: <RequireRole roles={[]} superuserAllowed />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            element: <AdminLayout />,
            errorElement: <ErrorBoundary />,
            children: [
              { path: PATHS.ADMIN_HOME, element: <AdminHomePage /> },
              { path: PATHS.BOUTIQUES,  element: <BoutiquesPage /> },
            ],
          },
        ],
      },

      // ── Boutique user interface ─────────────────────────────────────────────
      {
        element: <RequireRole roles={['OWNER', 'MANAGER', 'EMPLOYEE']} superuserAllowed={false} />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            element: <Layout />,
            errorElement: <ErrorBoundary />,
            children: [
              { path: PATHS.HOME,         element: <HomePage /> },
              { path: PATHS.PRODUCTS,     element: <ProductsPage /> },
              { path: PATHS.STOCK_SHEET,  element: <StockSheetPage /> },
              { path: PATHS.LOW_STOCK,    element: <AlertsPage /> },
              { path: PATHS.ENTRIES,      element: <EntryPage /> },
              { path: PATHS.REMOVALS,     element: <RemovalPage /> },
              { path: PATHS.REMOVAL_FORM, element: <RemovalFormPage /> },
              { path: PATHS.SALES,            element: <SalesPage /> },
              { path: PATHS.REPORTS,          element: <Navigate to={PATHS.BILAN_MATERIEL} replace /> },
              { path: PATHS.BILAN_MATERIEL,   element: <BilanMaterielPage /> },

              // Alias pour anciens liens (compatibilité)
              { path: '/sales-invoices', element: <Navigate to={PATHS.SALES}    replace /> },
              { path: '/parameters',     element: <Navigate to={PATHS.SETTINGS} replace /> },

              { path: PATHS.BILAN_FINANCIER,  element: <BilanFinancierPage /> },
              { path: PATHS.SESSION,          element: <CashSessionPage /> },
              { path: PATHS.EXPENSES,         element: <ExpensePage /> },
              { path: PATHS.PROFILE,          element: <ProfilePage /> },

              // OWNER + superuser uniquement
              {
                errorElement: <ErrorBoundary />,
                element: <RequireRole roles={['OWNER']} superuserAllowed />,
                children: [
                  { path: PATHS.USERS,    element: <UsersPage /> },
                  { path: PATHS.SETTINGS, element: <SettingsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;

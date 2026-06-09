import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto]">
      <div className="h-16 shrink-0">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full w-64 shrink-0">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <div className="h-12 shrink-0">
        <Footer />
      </div>
    </div>
  );
}

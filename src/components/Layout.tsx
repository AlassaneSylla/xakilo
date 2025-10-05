import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Home from '../pages/Home'
import Products from '../pages/Products'
import Entries from '../pages/Entry'
import Removals from '../pages/Removal'
import Sheet from '../pages/Sheet'
import Parameters from '../pages/Parameters'
import Users from '../pages/Users'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto]">

            <div className="h-16 shrink-0">
                <Header />
            </div>

            <div className="flex flex-1 overflow-hidden">

              <div className="h-full w-64 shrink-0">
                <Sidebar />
              </div>

              <main className="flex-1 overflow-y-auto p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/entries" element={<Entries />} />
                    <Route path="/removals" element={<Removals />} />
                    <Route path="/sheet" element={<Sheet />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/parameters" element={<Parameters />} />
                </Routes>
                {children}
              </main>
            </div>

            <div className="h-12 shrink-0">
                <Footer />
            </div>

        </div>
    );
}

export default Layout
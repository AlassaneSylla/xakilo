import React from 'react';
import { AuthProvider } from './AuthProvider';
import { CashSessionProvider } from './CashSessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CashSessionProvider>
        {children}
      </CashSessionProvider>
    </AuthProvider>
  );
}
'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { CurrencyProvider } from '@/lib/currency-context';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export default function ClientBody({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

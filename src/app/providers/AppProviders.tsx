/**
 * Context Providers
 * Toast 通知、认证状态
 */

import type { ReactNode } from 'react';
import { ToastProvider } from '../../shared/ui';
import { AuthProvider } from '../contexts/AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}

export default AppProviders;

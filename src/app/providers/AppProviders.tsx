/**
 * Context Providers
 * Toast 通知
 */

import type { ReactNode } from 'react';
import { ToastProvider } from '../../shared/ui';

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

export default AppProviders;

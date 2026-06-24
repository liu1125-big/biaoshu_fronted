import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

function AppShell({ children }: AppShellProps) {
  return (
    <Tooltip.Provider delayDuration={120} skipDelayDuration={80}>
      <div className="app-shell">
        <Sidebar />

        <main className="main-area">
          <section className="content-shell" aria-label="主内容">
            {children}
          </section>
        </main>
      </div>
    </Tooltip.Provider>
  );
}

export default AppShell;

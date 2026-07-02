/**
 * 主布局: 侧边栏 + 内容区
 */

import * as Tooltip from '@radix-ui/react-tooltip';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppShell() {
  return (
    <Tooltip.Provider delayDuration={120} skipDelayDuration={80}>
      <div className="app-shell">
        <Sidebar />

        <main className="main-area">
          <section className="content-shell" aria-label="主内容">
            <Outlet />
          </section>
        </main>
      </div>
    </Tooltip.Provider>
  );
}

export default AppShell;

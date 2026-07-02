/**
 * 根组件
 * 配置全局路由规则
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TechnicalPlanEntry from './features/technical-plan/pages/TechnicalPlanEntry';
import KnowledgeBasePage from './features/knowledge-base/pages/KnowledgeBasePage';
import AnonymousPage from './features/anonymous/pages/AnonymousPage';
import LoginPage from './features/auth/pages/LoginPage';
import AppShell from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 - 不需要 AppShell */}
          <Route path="/login" element={<LoginPage />} />

          {/* 受保护的路由 - 需要 AppShell */}
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/technical-plan" replace />} />
            <Route path="technical-plan" element={<TechnicalPlanEntry />} />
            <Route path="document-knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="anonymous" element={<AnonymousPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TechnicalPlanEntry from './features/technical-plan/pages/TechnicalPlanEntry';
import KnowledgeBasePage from './features/knowledge-base/pages/KnowledgeBasePage';
import AppShell from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/technical-plan" replace />} />
            <Route path="/technical-plan" element={<TechnicalPlanEntry />} />
            <Route path="/document-knowledge-base" element={<KnowledgeBasePage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
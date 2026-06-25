import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TechnicalPlanHome from './features/technical-plan/pages/TechnicalPlanHome';
import KnowledgeBasePage from './features/knowledge-base/pages/KnowledgeBasePage';
import AppShell from './components/AppShell';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/technical-plan" replace />} />
          <Route path="/bid-generation" element={<Navigate to="/technical-plan" replace />} />
          <Route path="/technical-plan" element={<TechnicalPlanHome workflowKind="technical-plan" />} />
          <Route path="/existing-plan-expansion" element={<TechnicalPlanHome workflowKind="existing-plan-expansion" />} />
          <Route path="/document-knowledge-base" element={<KnowledgeBasePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;

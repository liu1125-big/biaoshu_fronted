import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TechnicalPlanHome from './features/technical-plan/pages/TechnicalPlanHome';
import ExportFormatPage from './features/export-format/pages/ExportFormatPage';
import AppShell from './components/AppShell';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/technical-plan" replace />} />
          <Route path="/technical-plan" element={<TechnicalPlanHome workflowKind="technical-plan" />} />
          <Route path="/existing-plan-expansion" element={<TechnicalPlanHome workflowKind="existing-plan-expansion" />} />
          <Route path="/export-format" element={<ExportFormatPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;

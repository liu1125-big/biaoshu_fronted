import type { KnowledgeBaseMigrationStatus, KnowledgeDocument } from '../types';

export function canOpenAnalysis(document: KnowledgeDocument) {
  return !['pending', 'copying', 'converting', 'extracting'].includes(document.status);
}

export function canOpenMarkdown(document: KnowledgeDocument) {
  return !['pending', 'copying'].includes(document.status);
}

export function canMoveKnowledgeDocument(document: KnowledgeDocument) {
  return ['ready_for_matching', 'success', 'error'].includes(document.status);
}

export function getMigrationCounts(status: KnowledgeBaseMigrationStatus) {
  const total = Math.max(0, Number(status.legacyDocumentCount || 0));
  const skipped = Math.max(0, Number(status.legacySkippedDocumentCount || 0));
  const completed = Math.max(0, Number(status.legacyCompletedDocumentCount ?? Math.max(0, total - skipped)));
  return { total, completed, skipped };
}

export function mergeDocuments<T extends { id: string }>(prev: T[], next: T[]) {
  const byId = new Map(prev.map((document) => [document.id, document]));
  next.forEach((document) => byId.set(document.id, document));
  return Array.from(byId.values());
}

export function formatInteger(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('zh-CN') : '-';
}

export function formatPercent(value?: number) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : '-';
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="knowledge-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

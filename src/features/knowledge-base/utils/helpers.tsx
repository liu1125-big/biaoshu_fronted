import type { KnowledgeDocument } from '../types';

export function canOpenMarkdown(document: KnowledgeDocument) {
  return !['pending', 'copying'].includes(document.status);
}

export function mergeDocuments<T extends { id: string }>(prev: T[], next: T[]) {
  const byId = new Map(prev.map((document) => [document.id, document]));
  next.forEach((document) => byId.set(document.id, document));
  return Array.from(byId.values());
}

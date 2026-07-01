/**
 * 工具函数(合并文档等)
 */

export function mergeDocuments<T extends { id: string }>(prev: T[], next: T[]) {
  const byId = new Map(prev.map((document) => [document.id, document]));
  next.forEach((document) => byId.set(document.id, document));
  return Array.from(byId.values());
}

import type { Components } from 'react-markdown';
import type { KnowledgeBaseIndex, KnowledgeDocument, KnowledgeAuditStatus } from '../types';

export const emptyIndex: KnowledgeBaseIndex = { folders: [], documents: [] };
export const emptyDocuments: KnowledgeDocument[] = [];
export const documentRenderBatchSize = 80;

export const statusLabels: Record<KnowledgeDocument['status'], string> = {
  pending: '等待处理',
  copying: '复制文件',
  converting: '转换 Markdown',
  extracting: '提取条目',
  ready_for_matching: '待匹配',
  matching: '匹配段落',
  recovering: '补漏中',
  analyzing: 'AI 整理中',
  saving: '保存结果',
  success: '完成',
  error: '失败',
};

export const auditStatusLabels: Record<KnowledgeAuditStatus, string> = {
  pending_review: '待审核',
  published: '已发布',
  deprecated: '已废弃',
};

export const contentMetricKeys = [
  'chars',
  'lines',
  'htmlTags',
  'htmlTables',
  'htmlRows',
  'htmlCells',
  'markdownImages',
  'htmlImages',
  'importedAssets',
  'bareUrls',
  'markdownLinks',
] as const;

export const knowledgeItemSourceComponents: Components = {
  a({ children }) {
    return <span className="knowledge-item-link-text">{children}</span>;
  },
  img({ node: _node, ...props }) {
    return <img {...props} loading="lazy" decoding="async" />;
  },
};

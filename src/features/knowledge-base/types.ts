// 文档处理状态
export type KnowledgeDocumentStatus = 'pending' | 'copying' | 'converting' | 'extracting' | 'ready_for_matching' | 'matching' | 'recovering' | 'analyzing' | 'saving' | 'success' | 'error';

// 审核发布状态
export type KnowledgeAuditStatus = 'pending_review' | 'published' | 'deprecated';

// 知识分类标签
export type KnowledgeTag = '企业介绍' | '资质证照' | '项目案例' | '技术方案' | '商务条款';

export const KNOWLEDGE_TAGS: KnowledgeTag[] = ['企业介绍', '资质证照', '项目案例', '技术方案', '商务条款'];

export interface KnowledgeFolder {
  id: string;
  name: string;
  sort_order?: number;
  tags?: KnowledgeTag[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  folder_id: string;
  file_name: string;
  status: KnowledgeDocumentStatus;
  progress: number;
  message: string;
  item_count: number;
  block_count?: number;
  filtered_block_count?: number;
  candidate_item_count?: number;
  discarded_block_count?: number;
  system_discarded_after_retry_count?: number;
  last_batch_size?: number;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  error?: string;
  tags?: KnowledgeTag[];
  audit_status?: KnowledgeAuditStatus;
  source?: string;
  batch_number?: string;
  version?: number;
}

export interface KnowledgeBaseIndex {
  folders: KnowledgeFolder[];
  documents: KnowledgeDocument[];
}

export interface KnowledgeBaseUploadResult {
  success: boolean;
  message: string;
  documents?: KnowledgeDocument[];
}

export interface KnowledgeBaseMutationResult {
  success: boolean;
  message: string;
}

export interface KnowledgeBaseEvent {
  document: KnowledgeDocument;
}

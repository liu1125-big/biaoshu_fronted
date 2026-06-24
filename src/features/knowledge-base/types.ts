export interface KnowledgeFolder {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  folder_id: string;
  file_name: string;
  status?: string;
  item_count?: number;
  markdown?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeBaseIndex {
  folders: KnowledgeFolder[];
  documents: KnowledgeDocument[];
}

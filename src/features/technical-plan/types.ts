/**
 * 标书相关类型定义
 */

// ============== 基础类型 ==============

export type TechnicalPlanStep = 'document-analysis' | 'bid-analysis' | 'outline-generation' | 'content-edit';
export type BidAnalysisMode = 'key' | 'full' | 'custom';
export type ProjectStatus = 'draft' | 'in-progress' | 'completed' | 'archived';

// ============== 项目相关 ==============

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  tender_file_name?: string;
  outline_section_count?: number;
  content_word_count?: number;
}

// ============== 投标分析任务 ==============

export interface BidAnalysisTaskDefinition {
  id: string;
  label: string;
  description: string;
  required: boolean;
  output: 'markdown' | 'json';
}

export type BidAnalysisTasks = Record<string, BidAnalysisTaskState>;

export interface BidAnalysisTaskState {
  id: string;
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  content: string;
  error?: string;
}

// ============== 大纲相关 ==============

export interface OutlineItem {
  id: string;
  title: string;
  description: string;
  children?: OutlineItem[];
  content?: string;
  source_requirement_title?: string;
}

export interface OutlineData {
  project_name: string;
  outline: OutlineItem[];
}

// ============== API 返回类型（被其他模块引用）==============

export interface ProjectListResult {
  success: boolean;
  message?: string;
  projects: Project[];
}

export interface ProjectMutationResult {
  success: boolean;
  message?: string;
  project?: Project;
}

export interface ContentGenerationSectionState {
  id: string;
  title: string;
  status: 'idle' | 'running' | 'success' | 'error';
  content: string;
  error?: string;
  updated_at?: string;
}

export interface ContentGenerationPlanData {
  writing_focus?: string;
  knowledge: { item_ids: string[] };
  facts: { titles: string[] };
  table: { needed: boolean; purpose: string };
  mermaid: { needed: boolean; title: string; code: string; priority: number; reason: string };
  image: { needed: boolean; style: string; title: string; prompt: string; priority: number; reason: string };
}

export interface ContentGenerationPlanState {
  plan: ContentGenerationPlanData;
  illustration_type: 'ai' | 'mermaid' | 'none';
  table_requirement?: 'none' | 'light' | 'moderate' | 'heavy';
  updated_at?: string;
}

export interface ContentGenerationRuntimeState {
  phase?: string;
  touched_item_ids?: string[];
  expansion_cycle_item_ids?: string[];
  expansion_attempted_item_ids?: string[];
  expansion_cycle_start_words?: number;
  target_item_id?: string;
  regenerate_requirement?: string;
  updated_at?: string;
}

// ============== 页面 Props ==============

export interface DocumentAnalysisPageProps {
  tenderFile: { fileName: string; markdownChars: number } | null;
  tenderMarkdown: string;
  onFileImported?: (state: { tenderFile: { fileName: string; markdownChars: number }; markdown: string }) => void;
  onStateChange?: (state: Partial<TechnicalPlanState>) => void;
}

export interface BidAnalysisPageProps {
  hasTenderFile: boolean;
  mode: BidAnalysisMode;
  selectedTaskIds: string[];
  tasks: BidAnalysisTasks;
  progress?: number;
  onProgressChange?: (progress: number) => void;
  onConfigSaved?: (state: Partial<TechnicalPlanState>) => void;
}

export interface OutlineEditPageProps {
  projectOverview: string;
  techRequirements: string;
  outlineData: OutlineData | null;
  onOutlineChange?: (data: OutlineData) => void;
  onSortGuardChange?: (guard: { hasUnsavedSort: () => boolean; saveSort: () => Promise<void>; discardSort: () => void } | null) => void;
}

export interface ContentEditPageProps {
  outlineData: OutlineData | null;
  sections?: Record<string, { content: string; status: string }>;
  onContentSaved?: (item: OutlineItem, content: string) => void;
  onContentGenerationOptionsChange?: (options: ContentGenerationOptions) => void;
}

export interface ContentGenerationOptions {
  useAiImages: boolean;
  maxAiImages: number;
  useMermaidImages: boolean;
  tableRequirement: 'none' | 'light' | 'moderate' | 'heavy';
  enableConsistencyAudit: boolean;
  consistencyRepairMode: 'agent' | 'normal';
}

// ============== 简化后的完整状态 ==============

export interface TechnicalPlanState {
  step: TechnicalPlanStep;
  tenderFile: { fileName: string; markdownChars: number } | null;
  projectOverview: string;
  techRequirements: string;
  bidAnalysisMode: BidAnalysisMode;
  bidAnalysisSelectedTaskIds: string[];
  bidAnalysisTasks: BidAnalysisTasks;
  outlineData: OutlineData | null;
}
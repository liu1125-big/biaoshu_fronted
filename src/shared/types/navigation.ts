/**
 * 导航相关类型(菜单项、子菜单)
 */

export type SectionId =
  | 'technical-plan'
  | 'knowledge-base'
  | 'document-knowledge-base'
  | 'anonymous';

export interface AppSubMenuItem {
  id: SectionId;
  label: string;
  description: string;
  icon?: 'document' | 'expand' | 'briefcase' | 'compare' | 'shield' | 'code' | 'prompt' | 'file' | 'export' | 'tool';
}

export interface AppMenuItem {
  id: SectionId;
  label: string;
  description: string;
  icon?: 'document' | 'expand' | 'briefcase' | 'compare' | 'shield' | 'code' | 'prompt' | 'file' | 'export' | 'tool';
  children?: AppSubMenuItem[];
}

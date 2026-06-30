/**
 * 侧边栏菜单配置
 */

import type { AppMenuItem, SectionId } from '../shared/types/navigation';

export const appMenuItems: AppMenuItem[] = [
  {
    id: 'technical-plan',
    label: '标书生成',
    description: '根据招标文件解析生成标书',
  },
  {
    id: 'knowledge-base',
    label: '知识库',
    description: '文档管理与知识条目提取',
    children: [
      {
        id: 'document-knowledge-base',
        label: '文档知识库',
        description: '管理历史资料，提取知识条目用于标书生成',
      },
    ],
  },
  {
    id: 'anonymous',
    label: '匿名化工具',
    description: '文档敏感信息脱敏处理',
    icon: 'shield',
  },
];

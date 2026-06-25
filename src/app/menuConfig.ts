import type { AppMenuItem, SectionId } from '../shared/types/navigation';

export const appMenuItems: AppMenuItem[] = [
  {
    id: 'bid-generation',
    label: '标书生成',
    description: '技术方案与商务标编制',
    children: [
      {
        id: 'technical-plan',
        label: '生成技术方案',
        description: '根据招标文件重头编写一份标书',
        icon: 'document',
      },
    ],
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
        icon: 'document',
      },
    ],
  },
];

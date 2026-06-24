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
      {
        id: 'existing-plan-expansion',
        label: '已有方案扩写',
        description: '解决人写技术方案太薄的问题，上传写好的方案，进行优化和扩充',
        icon: 'expand',
      },
    ],
  },
  {
    id: 'export-format',
    label: '导出格式',
    description: 'Word 文档排版与编号格式设置',
  },
];

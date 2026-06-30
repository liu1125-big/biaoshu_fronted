/**
 * 树形结构工具（收集叶子节点等）
 */

export interface TreeNode<T> {
  id: string;
  title?: string;
  description?: string;
  children?: T[];
}

export function collectLeaves<T extends TreeNode<T>>(items: T[]): T[] {
  return items.flatMap((item) =>
    item.children?.length ? collectLeaves(item.children) : [item]
  );
}

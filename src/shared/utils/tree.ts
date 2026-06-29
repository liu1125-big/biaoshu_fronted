export interface TreeNode<T> {
  id: string;
  title?: string;
  description?: string;
  children?: T[];
}

/**
 * Recursively collects all leaf nodes from a tree structure.
 * A leaf node is one that has no children (or children array is empty/undefined).
 */
export function collectLeaves<T extends TreeNode<T>>(items: T[]): T[] {
  return items.flatMap((item) =>
    item.children?.length ? collectLeaves(item.children) : [item]
  );
}

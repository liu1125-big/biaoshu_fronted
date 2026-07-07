import { useState } from 'react';
import type { MenuItem } from '../types';
import styles from '../css/user-profile.module.css';

interface MenuTreeNodeProps {
  menu: MenuItem;
  selectedId: string | null;
  onSelect: (menu: MenuItem) => void;
}

export function MenuTreeNode({ menu, selectedId, onSelect }: MenuTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;
  const isSelected = selectedId === menu.id;

  return (
    <div className={styles.menuTreeNode}>
      <div className={`${styles.menuTreeContent} ${isSelected ? styles.menuTreeContentSelected : ''}`} onClick={() => onSelect(menu)}>
        <span className={styles.menuTreeToggle} onClick={(e) => { e.stopPropagation(); hasChildren && setExpanded(!expanded); }}>
          {hasChildren && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={expanded ? styles.chevronDown : styles.chevronRight}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </span>
        <span className={styles.menuTreeName}>{menu.name}</span>
      </div>
      {hasChildren && expanded && (
        <div className={styles.menuTreeChildren}>
          {menu.children!.map((child) => <MenuTreeNode key={child.id} menu={child} selectedId={selectedId} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}

import type { MenuItem } from '../types';
import styles from '../css/user-profile.module.css';

interface MenuTreeWithCheckboxesProps {
  menus: MenuItem[];
  selectedMenus: Set<string>;
  onToggleMenu: (id: string) => void;
  expandedMenus: Set<string>;
  onToggleMenuSection: (id: string) => void;
}

export function MenuTreeWithCheckboxes({ menus, selectedMenus, onToggleMenu, expandedMenus, onToggleMenuSection }: MenuTreeWithCheckboxesProps) {
  const toggleMenu = (menu: MenuItem) => {
    onToggleMenu(menu.id);
    if (menu.children && menu.children.length > 0) {
      const toggleChildren = (children: MenuItem[]) => {
        children.forEach((child) => { onToggleMenu(child.id); if (child.children) toggleChildren(child.children); });
      };
      if (!selectedMenus.has(menu.id)) toggleChildren(menu.children);
    }
  };

  const renderMenu = (menu: MenuItem, _level: number = 0, isTopLevel: boolean = false): React.ReactNode => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isSelected = selectedMenus.has(menu.id);
    const someChildrenSelected = hasChildren ? menu.children!.some((c) => selectedMenus.has(c.id)) : false;
    const isExpanded = expandedMenus.has(menu.id);

    return (
      <div key={menu.id} className={styles.menuTreeNode}>
        <div className={styles.menuTreeContent}>
          {hasChildren && isTopLevel && (
            <span className={styles.menuTreeToggle} onClick={() => onToggleMenuSection(menu.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isExpanded ? styles.chevronDown : styles.chevronRight}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          )}
          {hasChildren && !isTopLevel && <span style={{ width: 16, display: 'inline-block' }}></span>}
          <input type="checkbox" className={styles.menuTreeCheckbox} checked={isSelected} ref={(el) => { if (el) el.indeterminate = someChildrenSelected && !isSelected; }} onChange={() => toggleMenu(menu)} />
          <span className={styles.menuTreeName}>{menu.name}</span>
          {menu.route && <span className={styles.menuTreeRoute}>{menu.route}</span>}
        </div>
        {hasChildren && isExpanded && <div className={styles.menuTreeChildren}>{menu.children!.map((child) => renderMenu(child, _level + 1, false))}</div>}
      </div>
    );
  };

  return <div className={styles.menuTree}>{menus.map((menu) => renderMenu(menu, 0, true))}</div>;
}

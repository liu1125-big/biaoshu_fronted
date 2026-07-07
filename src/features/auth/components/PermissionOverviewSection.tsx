import { useState, useEffect, useMemo } from 'react';
import type { PermissionItem } from '../types';
import { mockGetPermissions } from '../mock/mockData';
import styles from '../css/user-profile.module.css';

export function PermissionOverviewSection() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => { mockGetPermissions().then((res) => { setPermissions(res); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissions.forEach((p) => { if (!groups[p.resource]) groups[p.resource] = []; groups[p.resource].push(p); });
    return groups;
  }, [permissions]);

  const filteredGroups = useMemo(() => {
    if (!keyword.trim()) return groupedPermissions;
    const filtered: Record<string, PermissionItem[]> = {};
    Object.entries(groupedPermissions).forEach(([resource, perms]) => {
      const matched = perms.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()) || p.code.toLowerCase().includes(keyword.toLowerCase()) || p.action.toLowerCase().includes(keyword.toLowerCase()));
      if (matched.length > 0) filtered[resource] = matched;
    });
    return filtered;
  }, [groupedPermissions, keyword]);

  const toggleGroup = (resource: string) => setExpandedGroups((prev) => { const next = new Set(prev); next.has(resource) ? next.delete(resource) : next.add(resource); return next; });
  const expandAll = () => setExpandedGroups(new Set(Object.keys(groupedPermissions)));
  const collapseAll = () => setExpandedGroups(new Set());

  return (
    <div className={styles.permissionOverviewContent}>
      <div className={styles.permissionOverviewHeader}>
        <input type="text" className={styles.permissionOverviewSearch} placeholder="搜索权限名称、编码、操作..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <span className={styles.permissionOverviewStat}>共 <strong>{permissions.length}</strong> 个权限点，<strong>{Object.keys(groupedPermissions).length}</strong> 个模块</span>
        <div className={styles.permissionOverviewActions}>
          <button type="button" className={styles.btnDefault} onClick={expandAll}>展开全部</button>
          <button type="button" className={styles.btnDefault} onClick={collapseAll}>折叠全部</button>
        </div>
      </div>
      {loading ? <div className={styles.loadingState}>加载中...</div> : Object.entries(filteredGroups).map(([resource, perms]) => {
        const isExpanded = expandedGroups.has(resource);
        return (
          <div key={resource} className={styles.permissionOverviewGroup}>
            <div className={styles.overviewGroupHeader} onClick={() => toggleGroup(resource)}>
              <span className={`${styles.overviewGroupToggle} ${isExpanded ? styles.overviewGroupToggleExpanded : ''}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></span>
              <span>{resource}</span>
              <span className={styles.overviewGroupCount}>{perms.length} 个权限</span>
            </div>
            {isExpanded && <div className={styles.overviewGroupList}>{perms.map((perm) => (
              <div key={perm.id} className={styles.overviewGroupItem}><span className={styles.overviewGroupItemName}>{perm.name}</span><span className={styles.overviewGroupItemAction}>{perm.action}</span><span className={styles.overviewGroupItemCode}>{perm.code}</span></div>
            ))}</div>}
          </div>
        );
      })}
    </div>
  );
}

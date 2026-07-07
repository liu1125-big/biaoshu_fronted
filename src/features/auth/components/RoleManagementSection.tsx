import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoleItem, PermissionItem, MenuItem } from '../types';
import { mockGetRoles, mockGetPermissions, mockGetMenus } from '../mock/mockData';
import { StatusTag } from './StatusTag';
import { MenuTreeWithCheckboxes } from './MenuTreeWithCheckboxes';
import styles from '../css/user-profile.module.css';

export function RoleManagementSection() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const fetchRoles = useCallback(() => {
    setLoading(true);
    mockGetRoles({ keyword: keyword || undefined }).then((res) => {
      setRoles(res.items);
      if (res.items.length > 0 && !selectedRoleId) setSelectedRoleId(res.items[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [keyword, selectedRoleId]);

  useEffect(() => { fetchRoles(); mockGetPermissions().then(setPermissions); mockGetMenus().then(setMenus); }, [fetchRoles]);

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find((r) => r.id === selectedRoleId);
      if (role) { setSelectedPermissions(new Set(role.permissions.map((p) => p.id))); setSelectedMenus(new Set(role.menus.map((m) => m.id))); setIsDirty(false); }
    }
  }, [selectedRoleId, roles]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissions.forEach((p) => { if (!groups[p.resource]) groups[p.resource] = []; groups[p.resource].push(p); });
    return groups;
  }, [permissions]);

  const togglePermission = (id: string) => { setSelectedPermissions((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); setIsDirty(true); };
  const toggleGroupPermissions = (resource: string, checked: boolean) => { setSelectedPermissions((prev) => { const next = new Set(prev); (groupedPermissions[resource] || []).forEach((p) => checked ? next.add(p.id) : next.delete(p.id)); return next; }); setIsDirty(true); };
  const toggleMenu = (id: string) => { setSelectedMenus((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); setIsDirty(true); };
  const togglePermissionGroup = (resource: string) => setExpandedPermissions((prev) => { const next = new Set(prev); next.has(resource) ? next.delete(resource) : next.add(resource); return next; });
  const toggleMenuSection = (id: string) => setExpandedMenus((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const handleSave = () => setTimeout(() => setIsDirty(false), 500);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className={styles.roleLayout}>
      <div className={styles.roleListPanel}>
        <div className={styles.roleListHeader}><span className={styles.roleListTitle}>角色列表</span><span className={styles.roleListCount}>共 {roles.length} 个</span></div>
        <div className={styles.roleListSearchWrapper}><input type="text" className={styles.roleListSearch} placeholder="搜索角色..." value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        <div className={styles.roleList}>{loading ? <div className={styles.loadingState}>加载中...</div> : roles.length === 0 ? <div className={styles.emptyState}>暂无角色</div> : roles.map((role) => (
          <div key={role.id} className={`${styles.roleItem} ${selectedRoleId === role.id ? styles.roleItemActive : ''}`} onClick={() => setSelectedRoleId(role.id)}>
            <div className={styles.roleItemInfo}><div className={styles.roleItemName}>{role.name}</div><div className={styles.roleItemCode}>{role.code}</div></div>
            <div className={styles.roleItemStatus}><StatusTag status={role.status} /></div>
          </div>
        ))}</div>
      </div>
      <div className={styles.configPanel}>
        {!selectedRole ? <div className={styles.emptyState}>请选择角色</div> : (
          <>
            <div className={styles.configHeader}>
              <span className={styles.configTitle}>配置角色：{selectedRole.name}<span style={{ marginLeft: 12, fontSize: 12, fontWeight: 400, color: isDirty ? '#faad14' : '#52c41a' }}>{isDirty ? '● 未保存' : '● 已保存'}</span></span>
              <div className={styles.configActions}>
                <button type="button" className={styles.btnSaveConfig}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>新建角色</button>
                <button type="button" className={styles.btnSaveConfig} onClick={handleSave}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>保存配置</button>
                <button type="button" className={styles.btnEditRole}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>编辑角色</button>
                <button type="button" className={styles.btnDanger}>删除角色</button>
              </div>
            </div>
            <div className={styles.configContent}>
              <div className={styles.configLeft}>
                <div className={styles.configSection}>
                  <div className={styles.configSectionTitle}><div className={styles.configSectionTitleLeft}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>权限点配置</div><div className={styles.configSectionTitleRight}>已选 {selectedPermissions.size}/{permissions.length}</div></div>
                  {Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const groupChecked = perms.every((p) => selectedPermissions.has(p.id));
                    const groupIndeterminate = perms.some((p) => selectedPermissions.has(p.id)) && !groupChecked;
                    const isExpanded = expandedPermissions.has(resource);
                    return (
                      <div key={resource} className={styles.permissionGroup}>
                        <div className={styles.permissionGroupTitle}>
                          <span className={styles.permissionGroupToggle} onClick={() => togglePermissionGroup(resource)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isExpanded ? styles.chevronDown : styles.chevronRight}><polyline points="6 9 12 15 18 9" /></svg></span>
                          <input type="checkbox" checked={groupChecked} ref={(el) => { if (el) el.indeterminate = groupIndeterminate; }} onChange={(e) => toggleGroupPermissions(resource, e.target.checked)} />
                          <span>{resource}</span>
                        </div>
                        {isExpanded && <div className={styles.permissionList}>{perms.map((perm) => (
                          <div key={perm.id} className={styles.permissionItem}><input type="checkbox" checked={selectedPermissions.has(perm.id)} onChange={() => togglePermission(perm.id)} /><span className={styles.permissionItemName}>{perm.name}</span><span className={styles.permissionItemCode}>{perm.code}</span></div>
                        ))}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.configRight}>
                <div className={styles.configSection}>
                  <div className={styles.configSectionTitle}><div className={styles.configSectionTitleLeft}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>菜单权限配置</div><div className={styles.configSectionTitleRight}>已选 {selectedMenus.size}/{menus.length}</div></div>
                  <MenuTreeWithCheckboxes menus={menus} selectedMenus={selectedMenus} onToggleMenu={toggleMenu} expandedMenus={expandedMenus} onToggleMenuSection={toggleMenuSection} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import { mockGetMenus } from '../mock/mockData';
import { MenuTreeNode } from './MenuTreeNode';
import styles from '../css/user-profile.module.css';

export function MenuManagementSection() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: '', route: '', component: '', icon: '', sort_order: 0, visible: true });

  useEffect(() => { mockGetMenus().then((res) => { setMenus(res); setLoading(false); }).catch(() => setLoading(false)); }, []);

  useEffect(() => { if (selectedMenu) setFormData({ name: selectedMenu.name || '', route: selectedMenu.route || '', component: selectedMenu.component || '', icon: selectedMenu.icon || '', sort_order: selectedMenu.sort_order || 0, visible: selectedMenu.visible ?? true }); }, [selectedMenu]);

  const handleInputChange = (field: string, value: string | number | boolean) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={styles.menuManagementLayout}>
      <div className={styles.menuTreePanel}>
        <div className={styles.menuTreePanelHeader}>菜单树</div>
        <div className={styles.menuTreePanelContent}>{loading ? <div className={styles.loadingState}>加载中...</div> : menus.length === 0 ? <div className={styles.emptyState}>暂无菜单</div> : menus.map((menu) => <MenuTreeNode key={menu.id} menu={menu} selectedId={selectedMenu?.id || null} onSelect={setSelectedMenu} />)}</div>
      </div>
      <div className={styles.menuFormPanel}>
        <div className={styles.menuFormPanelHeader}>{selectedMenu ? `编辑菜单：${selectedMenu.name}` : '请选择菜单'}</div>
        <div className={styles.menuFormPanelContent}>
          {!selectedMenu ? <div className={styles.emptyState}>请从左侧选择一个菜单进行编辑</div> : (
            <>
              {(['name', 'route', 'component', 'icon'] as const).map((field) => (
                <div key={field} className={styles.formGroup}><label className={styles.formLabel}>{field === 'name' ? '菜单名称' : field === 'route' ? '路由路径' : field === 'component' ? '组件路径' : '图标'}</label><input type="text" className={styles.formInput} value={formData[field]} onChange={(e) => handleInputChange(field, e.target.value)} placeholder={field === 'route' ? '/example' : field === 'component' ? 'pages/Example' : 'IconName'} /></div>
              ))}
              <div className={styles.formGroup}><label className={styles.formLabel}>排序权重</label><input type="number" className={styles.formInput} value={formData.sort_order} onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)} /></div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>显示状态</label>
                <div className={styles.formSwitch}><span className={`${styles.switchTrack} ${formData.visible ? styles.switchTrackActive : ''}`} onClick={() => handleInputChange('visible', !formData.visible)}><span className={`${styles.switchThumb} ${formData.visible ? styles.switchThumbActive : ''}`} /></span><span className={styles.switchLabel}>{formData.visible ? '菜单可见' : '菜单隐藏'}</span></div>
              </div>
              <div style={{ marginTop: 24 }}><button type="button" className={styles.btnSave}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>保存修改</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

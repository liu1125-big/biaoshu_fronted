/**
 * 用户与权限管理页面
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserManagementSection, RoleManagementSection, PermissionOverviewSection, MenuManagementSection } from '../components';
import styles from '../css/user-profile.module.css';

type TabId = 'users' | 'roles' | 'permissions' | 'menus';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'users', label: '用户管理', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
  { id: 'roles', label: '角色管理', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
  { id: 'permissions', label: '权限总览', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
  { id: 'menus', label: '菜单管理', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg> },
];

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => { document.title = '用户与权限管理'; }, []);
  if (!user) return null;

  const handleLogout = () => { setShowUserMenu(false); logout(); navigate('/login'); };

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}><span className={styles.headerDot}></span><h1 className={styles.headerTitle}>用户与权限管理</h1></div>
          <div className={styles.headerRight}>
            <div className={styles.statusCapsule}><span className={styles.statusDot}></span>已登录</div>
            <button type="button" className={`${styles.capsuleBtn} ${styles.refreshCapsule}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>刷新数据</button>
            <button type="button" className={`${styles.capsuleBtn} ${styles.createCapsule}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>新建用户</button>
            <div className={styles.userDropdownWrapper}>
              <div className={styles.userCapsule} onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className={styles.userCapsuleAvatar}>{user.username?.charAt(0).toUpperCase() || 'U'}</div>
                <span className={styles.userCapsuleName}>{user.name || user.username}</span>
                <svg className={styles.userCapsuleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
              {showUserMenu && (
                <div className={styles.userDropdownMenu}>
                  <div className={styles.userDropdownItem}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>个人信息</div>
                  <div className={`${styles.userDropdownItem} ${styles.danger}`} onClick={handleLogout}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>退出登录</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.managementCard}>
          <div className={styles.tabs}>{tabs.map((tab) => <div key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.icon}{tab.label}</div>)}</div>
          <div className={styles.tabContent}>
            {activeTab === 'users' && <UserManagementSection />}
            {activeTab === 'roles' && <RoleManagementSection />}
            {activeTab === 'permissions' && <PermissionOverviewSection />}
            {activeTab === 'menus' && <MenuManagementSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

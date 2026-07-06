/**
 * 用户管理页面
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../../../shared/ui/Dialog';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import styles from '../css/user-profile.module.css';

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const navigate = useNavigate();

  // 弹窗状态
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);

  // 表单状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    document.title = '用户管理';
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerText}>
              <span className={styles.headerKicker}>用户模块</span>
              <h1 className={styles.headerTitle}>个人信息与权限管理</h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
        <div className={styles.cards} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerText}>
              <span className={styles.headerKicker}>用户模块</span>
              <h1 className={styles.headerTitle}>个人信息与权限管理</h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
        <div className={styles.cards} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      </div>
    );
  }

  // 格式化时间
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // 获取角色名称
  const roleName = profile?.roles?.[0]?.name || '-';

  return (
    <div className={styles.page}>
      {/* 顶部标题栏 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerText}>
            <span className={styles.headerKicker}>用户模块</span>
            <h1 className={styles.headerTitle}>个人信息与权限管理</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            退出登录
          </button>
        </div>
      </div>

      {/* 两列卡片 */}
      <div className={styles.cards}>
        {/* 左卡片：账号个人信息 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>账号个人信息</h2>
          </div>

          {/* 头像区域 */}
          <div className={styles.profileSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{(profile?.username)?.[0]?.toUpperCase() || 'U'}</div>
              <span className={styles.onlineDot} />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.userName}>{profile?.username}</span>
              <div className={styles.profileTags}>
                <span className={styles.profileTag}>{roleName}</span>
                <span className={styles.profileTag}>登录于 {formatTime(profile?.last_login_at)}</span>
              </div>
            </div>
          </div>

          {/* 状态横幅 */}
          <div className={styles.statusBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <span className={styles.bannerTitle}>登录成功</span>
              <span className={styles.bannerSubtitle}>当前账号状态正常，可访问已授权功能。</span>
            </div>
          </div>

          {/* 基础信息 */}
          <div className={styles.sectionTitle}>基础信息</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>用户名</span>
              <span className={styles.infoValue}>{profile?.username}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>姓名</span>
              <span className={styles.infoValue}>{profile?.name || '-'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>角色</span>
              <span className={styles.infoValue}>{roleName}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>状态</span>
              <span className={styles.infoValue}>{profile?.status === 'enabled' ? '启用' : profile?.status || '-'}</span>
            </div>
          </div>

          {/* 账号设置 */}
          <div className={styles.sectionTitle}>账号设置</div>
          <div className={styles.settingGrid}>
            <button className={styles.settingItem} onClick={() => setPasswordOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              修改密码
            </button>
            <button className={styles.settingItem} onClick={() => setPhoneOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              绑定手机
            </button>
            <button className={styles.settingItem} onClick={() => setEmailOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              绑定邮箱
            </button>
          </div>
        </div>

        {/* 右卡片：权限管理 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>权限信息管理</h2>
          </div>

          {/* 权限概览 */}
          <div className={styles.sectionTitle}>权限概览</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>权限级别</span>
              <span className={styles.infoValue}>{roleName}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>访问范围</span>
              <span className={styles.infoValue}>{profile?.roles?.[0]?.code === 'admin' ? '全部业务模块' : '受限模块'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>状态</span>
              <span className={styles.infoValue}>{profile?.status === 'enabled' ? '已生效' : '已禁用'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>管理入口</span>
              <span className={styles.infoValue}>{profile?.roles?.[0]?.code === 'admin' ? '支持权限管理' : '不支持'}</span>
            </div>
          </div>

          {/* 角色说明 */}
          <div className={styles.sectionTitle}>角色说明</div>
          <div className={styles.roleDesc}>
            <p>{roleName === '系统管理员' ? '管理员拥有系统全部权限，可管理所有业务模块。' : '当前用户权限受限，部分功能无法访问。'}</p>
          </div>

          {/* 权限管理按钮 */}
          <div className={styles.permissionBtn}>
            <button className={styles.btnPrimary} onClick={() => setPermissionOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              权限管理
            </button>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <Dialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        kicker="账号设置"
        title="修改密码"
        description="请输入旧密码和新密码来完成密码修改。"
        fields={[
          { label: '旧密码', value: oldPassword, setValue: setOldPassword, type: 'password', placeholder: '请输入旧密码' },
          { label: '新密码', value: newPassword, setValue: setNewPassword, type: 'password', placeholder: '请输入新密码' },
          { label: '确认新密码', value: confirmPassword, setValue: setConfirmPassword, type: 'password', placeholder: '请再次输入新密码' },
        ]}
        inputClassName={`${styles.input} ${styles.dialogInput}`}
        onConfirm={() => { setPasswordOpen(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
      />

      {/* 绑定手机弹窗 */}
      <Dialog
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        kicker="账号设置"
        title="绑定手机"
        description="请输入手机号来完成绑定。"
        fields={[
          { label: '手机号', value: phone, setValue: setPhone, type: 'tel', placeholder: '请输入手机号' },
        ]}
        inputClassName={`${styles.input} ${styles.dialogInput}`}
        onConfirm={() => { setPhoneOpen(false); setPhone(''); }}
      />

      {/* 绑定邮箱弹窗 */}
      <Dialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        kicker="账号设置"
        title="绑定邮箱"
        description="请输入邮箱地址来完成绑定。"
        fields={[
          { label: '邮箱', value: email, setValue: setEmail, type: 'email', placeholder: '请输入邮箱地址' },
        ]}
        inputClassName={`${styles.input} ${styles.dialogInput}`}
        onConfirm={() => { setEmailOpen(false); setEmail(''); }}
      />

      {/* 权限管理弹窗 */}
      <Dialog
        open={permissionOpen}
        onOpenChange={setPermissionOpen}
        kicker="权限管理"
        title="权限管理"
        description="管理用户的权限设置和访问控制。"
        maxWidth={600}
        children={
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>权限级别</span>
              <span className={styles.infoValue}>{roleName}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>访问范围</span>
              <span className={styles.infoValue}>{profile?.roles?.[0]?.code === 'admin' ? '全部业务模块' : '受限模块'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>状态</span>
              <span className={styles.infoValue}>{profile?.status === 'enabled' ? '已生效' : '已禁用'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>管理入口</span>
              <span className={styles.infoValue}>{profile?.roles?.[0]?.code === 'admin' ? '支持' : '不支持'}</span>
            </div>
          </div>
        }
        confirmText="关闭"
        onConfirm={() => setPermissionOpen(false)}
      />
    </div>
  );
}

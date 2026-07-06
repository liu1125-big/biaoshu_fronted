/**
 * 可折叠导航侧边栏
 */

import * as Tooltip from '@radix-ui/react-tooltip';
import { useState, type ComponentType, type ReactElement, type SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appMenuItems } from '../app/menuConfig';
import { useAuth } from '../app/contexts/AuthContext';
import type { AppMenuItem, SectionId } from '../shared/types/navigation';
import { ArchiveIcon, ChevronIcon, DocumentIcon, ShieldIcon } from '../shared/ui/Icons';
import logoUrl from '/icon_256.png';

const navigationIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'technical-plan': DocumentIcon,
  'knowledge-base': ArchiveIcon,
  anonymous: ShieldIcon,
};

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentPath = location.pathname;
  const activeSection = (currentPath.replace('/', '') || 'technical-plan') as SectionId;

  const handleMenuItemClick = (item: AppMenuItem) => {
    const targetId = item.children?.[0]?.id || item.id;
    navigate(`/${targetId}`);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-surface" />

      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </div>
        <div className="brand-copy">
          <span>AI标书</span>
          <strong>投标智能体</strong>
        </div>
      </div>

      <button
        type="button"
        className="collapse-button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? '展开菜单' : '收起菜单'}
      >
        <ChevronIcon className={collapsed ? 'rotate-180' : ''} />
      </button>

      <nav className="sidebar-nav" aria-label="主菜单">
        {appMenuItems.map((item) => {
          const Icon = navigationIcons[item.id];
          const isActive = item.id === activeSection || item.children?.some((c) => `/${c.id}` === currentPath);
          const button = (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {Icon && <Icon />}
              </span>
              <span className="nav-copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          );

          return collapsed ? wrapTooltip(item.label, button) : button;
        })}
      </nav>

      <div className="sidebar-user-card" onClick={() => user ? navigate('/profile') : navigate('/login')}>
        <span className="sidebar-user-label">当前账号</span>
        <div className="sidebar-user-content">
          <div className="sidebar-user-avatar-wrapper">
            <div className="sidebar-user-avatar">
              {user ? (user.nickname || user.username).charAt(0).toUpperCase() : '?'}
            </div>
            {user && <span className="sidebar-user-status" />}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user ? (user.nickname || user.username) : '未登录'}</span>
            <span className="sidebar-user-role">
              {user ? `在线 · ${user.role}` : '离线 · 请先登录'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function wrapTooltip(label: string, child: ReactElement) {
  return (
    <Tooltip.Root key={label}>
      <Tooltip.Trigger asChild>{child}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip-content" side="right" align="center" sideOffset={12}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export default Sidebar;

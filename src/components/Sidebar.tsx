import * as Tooltip from '@radix-ui/react-tooltip';
import { useState, type ComponentType, type ReactElement, type SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appMenuItems } from '../app/menuConfig';
import type { AppMenuItem, SectionId } from '../shared/types/navigation';
import { useToast } from '../shared/ui';
import { ArchiveIcon, ChevronIcon, DocumentIcon } from '../shared/ui/Icons';
import logoUrl from '/icon_256.png';

const navigationIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'technical-plan': DocumentIcon,
  'knowledge-base': ArchiveIcon,
};

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const activeSection = (currentPath.replace('/', '') || 'technical-plan') as SectionId;

  const handleMenuItemClick = (item: AppMenuItem) => {
    if (!item.notice) {
      const targetId = item.children?.[0]?.id || item.id;
      navigate(`/${targetId}`);
      return;
    }

    showToast(item.notice.message, 'info', {
      duration: 7000,
      actions: item.notice.externalUrl ? [
        {
          label: item.notice.actionLabel || '打开链接',
          variant: 'primary',
          onClick: () => {
            window.open(item.notice?.externalUrl || '', '_blank', 'noopener,noreferrer');
          },
        },
      ] : undefined,
    });
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
          <strong>Web前端</strong>
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

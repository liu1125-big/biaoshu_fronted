import * as Tooltip from '@radix-ui/react-tooltip';
import { useState, type ComponentType, type ReactElement, type SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appMenuItems } from '../app/menuConfig';
import type { AppMenuItem, SectionId } from '../shared/types/navigation';
import { useToast } from '../shared/ui';
import logoUrl from '/icon_256.png';

const navigationIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'bid-generation': BidGenerationIcon,
  'technical-plan': DocumentIcon,
  'existing-plan-expansion': ExpandIcon,
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

function BidGenerationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 5.2h7.2l4.8 4.8v8.8H6z" />
      <path d="M13 5.5V10h4.5" />
      <path d="M8.8 13.2h6.4" />
      <path d="M8.8 16.3h4.5" />
      <path d="M4.5 7.2v13h12" />
    </svg>
  );
}

function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3.75h6.7L18 8.05v12.2H7z" />
      <path d="M13.5 4v4.35h4.25" />
      <path d="M9.5 12.2h5" />
      <path d="M9.5 15.7h4" />
    </svg>
  );
}

function ExpandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function ExportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3.75h6.7L18 8.05v12.2H7z" />
      <path d="M13.5 4v4.35h4.25" />
      <path d="M9.5 12.2h5" />
      <path d="M9.5 15.7h4" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m14 7-5 5 5 5" />
    </svg>
  );
}

function ArchiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 7.5v11c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-11" />
      <path d="M3 7.5l2-3h14l2 3" />
      <path d="M3 7.5h18" />
      <path d="M10 11.5h4" />
    </svg>
  );
}

export default Sidebar;

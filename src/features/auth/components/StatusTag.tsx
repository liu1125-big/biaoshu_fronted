import type { UserRole } from '../types';
import styles from '../css/user-profile.module.css';

interface StatusTagProps {
  status: string;
}

export function StatusTag({ status }: StatusTagProps) {
  const statusMap: Record<string, { label: string; className: string }> = {
    enabled: { label: '启用', className: styles.statusEnabled },
    disabled: { label: '禁用', className: styles.statusDisabled },
    frozen: { label: '冻结', className: styles.statusFrozen },
  };
  const config = statusMap[status] || { label: status, className: styles.statusDisabled };
  return <span className={`${styles.statusTag} ${config.className}`}>{config.label}</span>;
}

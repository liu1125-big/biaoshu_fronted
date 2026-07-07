import { useState } from 'react';
import type { UserRole } from '../types';
import styles from '../css/user-profile.module.css';

interface RoleTagsProps {
  roles: UserRole[];
}

export function RoleTags({ roles }: RoleTagsProps) {
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 3;

  if (!roles || roles.length === 0) {
    return <span className={styles.noData}>-</span>;
  }

  const visibleRoles = expanded ? roles : roles.slice(0, maxVisible);
  const hiddenCount = roles.length - maxVisible;

  const getRoleTagClass = (code: string) => ({
    admin: styles.roleTagAdmin,
    operator: styles.roleTagOperator,
  }[code] || styles.roleTagUser);

  return (
    <div className={styles.roleTags}>
      {visibleRoles.map((role) => (
        <span key={role.id} className={`${styles.roleTag} ${getRoleTagClass(role.code)}`}>
          {role.name}
        </span>
      ))}
      {!expanded && hiddenCount > 0 && (
        <span className={styles.roleMore} onClick={() => setExpanded(true)}>+{hiddenCount}</span>
      )}
      {expanded && hiddenCount > 0 && (
        <span className={styles.roleMore} onClick={() => setExpanded(false)}>收起</span>
      )}
    </div>
  );
}

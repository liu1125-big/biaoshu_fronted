import styles from '../css/user-profile.module.css';

interface FilterBarProps {
  keyword: string;
  onKeywordChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

export function FilterBar({ keyword, onKeywordChange, status, onStatusChange, role, onRoleChange, onReset, onSearch }: FilterBarProps) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterInputWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input type="text" className={styles.filterInput} placeholder="搜索用户名、姓名" value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />
      </div>
      <select className={styles.filterSelect} value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">全部</option><option value="enabled">启用</option><option value="disabled">禁用</option><option value="frozen">冻结</option>
      </select>
      <select className={styles.filterSelect} value={role} onChange={(e) => onRoleChange(e.target.value)}>
        <option value="">全部</option><option value="admin">系统管理员</option><option value="user">普通用户</option><option value="operator">操作员</option>
      </select>
      <div className={styles.filterActions}>
        <button type="button" className={styles.btnDefault} onClick={onReset}>重置</button>
        <button type="button" className={styles.btnQuery} onClick={onSearch}>查询</button>
      </div>
    </div>
  );
}

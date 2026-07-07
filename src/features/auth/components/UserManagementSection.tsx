import { useState, useEffect, useCallback } from 'react';
import type { UserItem } from '../types';
import { mockGetUsers } from '../mock/mockData';
import { StatusTag } from './StatusTag';
import { RoleTags } from './RoleTags';
import { Pagination } from './Pagination';
import { FilterBar } from './FilterBar';
import { formatTime } from '../../../shared/utils/formatTime';
import styles from '../css/user-profile.module.css';

export function UserManagementSection() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0 });
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => { const t = setTimeout(() => setDebouncedKeyword(keyword), 300); return () => clearTimeout(t); }, [keyword]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    mockGetUsers({ page: 1, page_size: 20, keyword: debouncedKeyword || undefined, status: status || undefined, role: role || undefined })
      .then((res) => { setUsers(res.items); setPagination(res.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedKeyword, status, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    setLoading(true);
    mockGetUsers({ page, page_size: pagination.page_size, keyword: debouncedKeyword || undefined, status: status || undefined, role: role || undefined })
      .then((res) => { setUsers(res.items); setPagination(res.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div className={styles.userManagementContent}>
      <div className={styles.userManagementHeader}><span className={styles.userManagementTitle}>用户管理</span></div>
      <FilterBar keyword={keyword} onKeywordChange={setKeyword} status={status} onStatusChange={setStatus} role={role} onRoleChange={setRole} onReset={() => { setKeyword(''); setStatus(''); setRole(''); }} onSearch={fetchUsers} />
      <div className={styles.tableWrapper}>
        {loading ? <div className={styles.loadingState}>加载中...</div> : users.length === 0 ? <div className={styles.emptyState}>暂无数据</div> : (
          <table className={styles.table}>
            <thead><tr><th>用户名</th><th>姓名</th><th>状态</th><th>角色</th><th>最后登录</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td><td>{user.name || '-'}</td><td><StatusTag status={user.status} /></td><td><RoleTags roles={user.roles} /></td>
                <td className={styles.timeText}>{formatTime(user.last_login_at)}</td><td className={styles.timeText}>{formatTime(user.created_at)}</td>
                <td><div className={styles.tableActions}>
                  <button type="button" className={`${styles.actionBtn} ${styles.view}`}>查看</button>
                  <button type="button" className={`${styles.actionBtn} ${styles.edit}`}>编辑</button>
                  <button type="button" className={`${styles.actionBtn} ${styles.assign}`}>分配角色</button>
                  <button type="button" className={`${styles.actionBtn} ${styles.delete}`}>删除</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}</div>
      {!loading && users.length > 0 && <Pagination current={pagination.page} pageSize={pagination.page_size} total={pagination.total} onChange={handlePageChange} />}
    </div>
  );
}

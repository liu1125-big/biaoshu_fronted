import styles from '../css/user-profile.module.css';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const getPages = () => Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    totalPages <= 5 ? i + 1 : current <= 3 ? i + 1 : current >= totalPages - 2 ? totalPages - 4 + i : current - 2 + i
  );

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>共 <strong>{total}</strong> 条记录，每页 <strong>{pageSize}</strong> 条</div>
      <div className={styles.paginationControls}>
        <button type="button" className={styles.pageBtn} disabled={current <= 1} onClick={() => onChange(current - 1)}>&lt;</button>
        {getPages().map((page) => (
          <button key={page} type="button" className={`${styles.pageBtn} ${current === page ? styles.pageBtnActive : ''}`} onClick={() => onChange(page)}>{page}</button>
        ))}
        <button type="button" className={styles.pageBtn} disabled={current >= totalPages} onClick={() => onChange(current + 1)}>&gt;</button>
      </div>
    </div>
  );
}

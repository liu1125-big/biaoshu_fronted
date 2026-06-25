import * as Dialog from '@radix-ui/react-dialog';
import type { KnowledgeBaseMigrationStatus } from '../types';
import { getMigrationCounts } from '../utils/helpers';

interface KnowledgeMigrationDialogProps {
  open: boolean;
  status: KnowledgeBaseMigrationStatus;
  running: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function KnowledgeMigrationDialog({ open, status, running, onCancel, onConfirm }: KnowledgeMigrationDialogProps) {
  const { total, completed, skipped } = getMigrationCounts(status);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="content-regenerate-modal" />
        <Dialog.Content className="knowledge-migration-card">
          <div className="knowledge-migration-head">
            <span className="section-kicker">数据迁移</span>
            <Dialog.Title>知识库数据迁移</Dialog.Title>
            <Dialog.Description>知识库已升级为本地数据库管理，读写更高效，大量知识库也不卡</Dialog.Description>
          </div>

          <div className="knowledge-migration-body">
                        <section className={`knowledge-migration-warning${skipped ? ' is-warning' : ''}`}>
              <strong>迁移规则</strong>
              <p>本次只迁移状态为"已完成"的文档；未完成或处理中的文档会被丢弃，不会迁移到新版本知识库。</p>
            </section>
            <section className="knowledge-migration-lead">
              <strong>进行中文档处理方式</strong>
              <p>如果旧版知识库里还有未处理完成的文档，请先重新安装v2.4版本，将所有知识库文档解析为"已完成"状态后，再更新至v2.5以上版本执行迁移。</p>
            </section>



            <div className="knowledge-migration-stats" aria-label="旧知识库迁移统计">
              <div>
                <span>旧文档总数</span>
                <strong>{total}</strong>
              </div>
              <div>
                <span>可迁移：已完成</span>
                <strong>{completed}</strong>
              </div>
              <div className={skipped ? 'is-warning' : ''}>
                <span>将跳过：未完成/处理中</span>
                <strong>{skipped}</strong>
              </div>
            </div>
          </div>

          <div className="content-regenerate-actions knowledge-migration-actions">
            <button type="button" className="secondary-action" onClick={onCancel} disabled={running}>暂不迁移</button>
            <button type="button" className="primary-action" onClick={onConfirm} disabled={running}>
              {running ? '迁移中...' : '开始迁移'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default KnowledgeMigrationDialog;

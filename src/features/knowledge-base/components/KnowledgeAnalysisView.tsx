import type { KnowledgeAnalysisSnapshot, KnowledgeDocument } from '../types';
import { formatInteger, formatPercent, StatCard } from '../utils/helpers';

interface KnowledgeAnalysisViewProps {
  document: KnowledgeDocument;
  snapshot: KnowledgeAnalysisSnapshot | null;
  batchSize: number;
  startingMatching: boolean;
  onBatchSizeChange: (value: number) => void;
  onStartMatching: () => void;
  onRefresh: () => void;
}

function KnowledgeAnalysisView({ document, snapshot, batchSize, startingMatching, onBatchSizeChange, onStartMatching, onRefresh }: KnowledgeAnalysisViewProps) {
  const report = snapshot?.report;
  const canStart = ['ready_for_matching', 'success', 'error'].includes(document.status) && Boolean(snapshot?.candidate_items.length);

  return (
    <div className="knowledge-analysis-view">
      <div className="knowledge-analysis-command">
        <div>
          <strong>分批段落匹配</strong>
          <p>候选条目已由 AI 两轮抽取生成。这里设置每批投入多少条知识条目，程序会用稳定全文前缀循环匹配段落并执行补漏。</p>
        </div>
        <label>
          <span>每批条目数</span>
          <input
            type="number"
            min={1}
            max={100}
            value={batchSize}
            onChange={(event) => onBatchSizeChange(Number(event.target.value) || 1)}
          />
        </label>
        <button type="button" className="primary-action" onClick={onStartMatching} disabled={!canStart || startingMatching}>
          {startingMatching ? '提交中...' : document.status === 'success' ? '重新匹配' : '开始匹配'}
        </button>
        <button type="button" className="secondary-action" onClick={onRefresh}>刷新</button>
      </div>

      <div className="knowledge-analysis-stats">
        <StatCard label="有效 block" value={snapshot?.block_count ?? document.block_count ?? 0} />
        <StatCard label="筛除 block" value={snapshot?.filtered_blocks_count ?? document.filtered_block_count ?? 0} />
        <StatCard label="候选条目" value={snapshot?.candidate_items.length ?? document.candidate_item_count ?? 0} />
        <StatCard label="最终条目" value={report?.final_items_count ?? document.item_count ?? 0} />
        <StatCard label="覆盖率" value={report ? `${Math.round(report.coverage_rate * 100)}%` : '-'} />
        <StatCard label="补漏新增" value={report?.new_items_from_recovery_count ?? 0} />
        <StatCard label="Markdown 字符" value={formatInteger(snapshot?.markdown_chars)} />
        <StatCard label="保留 block 字符" value={formatInteger(snapshot?.kept_block_chars)} />
        <StatCard label="条目覆盖字符" value={formatInteger(snapshot?.covered_unique_content_chars)} />
        <StatCard label="原文真实覆盖率" value={formatPercent(snapshot?.coverage_rate_vs_markdown)} />
      </div>

      {report && (
        <div className="knowledge-analysis-report">
          <strong>处理报告</strong>
          <span>已匹配 {report.matched_blocks_count} 个 block</span>
          <span>AI 舍弃 {report.discarded_blocks_count} 个 block</span>
          <span>重试后系统舍弃 {report.system_discarded_after_retry_count} 个 block</span>
          <span>补漏轮次 {report.recovery_attempt_count}</span>
          <span>批次大小 {report.batch_size}</span>
        </div>
      )}

      {snapshot?.debug_log_path && (
        <div className="knowledge-analysis-debug-log">
          <strong>开发者日志</strong>
          <code>{snapshot.debug_log_path}</code>
        </div>
      )}

      <div className="knowledge-analysis-grid">
        <section className="knowledge-analysis-section">
          <div className="knowledge-panel-head">
            <strong>候选知识条目</strong>
            <span>{snapshot?.candidate_items.length || 0} 条</span>
          </div>
          <div className="knowledge-candidate-list">
            {snapshot?.candidate_items.length ? snapshot.candidate_items.map((item) => (
              <article className="knowledge-candidate-card" key={item.id}>
                <small>{item.id}</small>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
              </article>
            )) : <div className="knowledge-empty-box"><strong>暂无候选条目</strong><p>上传处理完成后会显示 AI 提取出的知识条目。</p></div>}
          </div>
        </section>

        <section className="knowledge-analysis-section">
          <div className="knowledge-panel-head">
            <strong>舍弃记录</strong>
            <span>{(snapshot?.discarded.length || 0) + (snapshot?.system_discarded_after_retry.length || 0)} 组</span>
          </div>
          <div className="knowledge-candidate-list">
            {snapshot && (snapshot.discarded.length || snapshot.system_discarded_after_retry.length) ? (
              [...snapshot.discarded, ...snapshot.system_discarded_after_retry].map((item, index) => (
                <article className="knowledge-candidate-card" key={`${item.reason}-${index}`}>
                  <small>{item.block_ids.length} 个 block</small>
                  <strong>{item.reason}</strong>
                  <p>{item.block_ids.join('、')}</p>
                </article>
              ))
            ) : <div className="knowledge-empty-box"><strong>暂无舍弃记录</strong><p>完成段落匹配和补漏后会显示。</p></div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default KnowledgeAnalysisView;

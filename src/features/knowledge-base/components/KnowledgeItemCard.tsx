import type { KnowledgeItem } from '../types';

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  developerMode: boolean;
  onOpenSource: () => void;
}

function KnowledgeItemCard({ item, developerMode, onOpenSource }: KnowledgeItemCardProps) {
  return (
    <article className="knowledge-item-card">
      {developerMode && <code className="knowledge-entity-id">条目ID：{item.id}</code>}
      <strong>{item.title}</strong>
      <p>{item.resume}</p>
      <button type="button" className="knowledge-item-source-action" onClick={onOpenSource}>查看原文</button>
    </article>
  );
}

export default KnowledgeItemCard;

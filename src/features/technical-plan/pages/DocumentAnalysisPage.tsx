import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import { isLibreOfficeRequiredMessage, MarkdownRenderer, useDocumentParseNotice, useToast } from '../../../shared/ui';
import type { FileParserProvider } from '../../../shared/types';
import type { PendingSectionSelection, TechnicalPlanState, TechnicalPlanTenderFile } from '../types';
import BidSectionSelectorDialog from '../components/BidSectionSelectorDialog';

type TechnicalPlanUploadBusy = 'tender' | 'section' | null;
type ParseStage = 'idle' | 'uploading' | 'parsing' | 'done';

const WORD_FILE_EXTENSIONS = new Set(['doc', 'docx']);

function isWordFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return Boolean(ext && WORD_FILE_EXTENSIONS.has(ext));
}

const parserLabels: Record<FileParserProvider, string> = {
  local: '本地解析',
  'mineru-accurate-api': 'MinerU 精准解析 API',
  'mineru-agent-api': 'MinerU-Agent 轻量解析 API',
};

function DocumentFilePill({ file }: { file: TechnicalPlanTenderFile }) {
  return (
    <div className="technical-document-file-pill">
      <div className="technical-document-file-icon">MD</div>
      <div className="technical-document-file-info">
        <strong>{file.fileName}</strong>
        <span>{[file.parserLabel, `${file.markdownChars} 字`].filter(Boolean).join(' · ')}</span>
      </div>
    </div>
  );
}

interface DocumentAnalysisPageProps {
  tenderFile: TechnicalPlanTenderFile | null;
  tenderMarkdown: string;
  pendingSectionSelection: PendingSectionSelection | null;
  demoMode: boolean;
  onFileImported: (state: TechnicalPlanState, markdown: string) => void;
  onStateChanged: (state: TechnicalPlanState) => void;
}

function readFileAsMarkdown(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    } else if (ext === 'docx' || ext === 'pdf' || ext === 'doc' || ext === 'wps') {
      resolve(`> 演示模式提示：${file.name}  \n> 该文件类型（.${ext}）需要通过后端解析服务转换为 Markdown。  \n> 当前为演示模式，此处显示为占位内容。部署后端后将自动解析为完整内容。\n\n---\n\n请部署后端 API 以获得真实解析结果。`);
    } else {
      reject(new Error(`不支持的文件类型：.${ext}`));
    }
  });
}

function DocumentAnalysisPage({
  tenderFile,
  tenderMarkdown,
  pendingSectionSelection,
  demoMode,
  onFileImported,
  onStateChanged,
}: DocumentAnalysisPageProps) {
  const [configuredParserLabel, setConfiguredParserLabel] = useState(parserLabels.local);
  const [busy, setBusy] = useState<TechnicalPlanUploadBusy>(null);
  const [pendingSelection, setPendingSelection] = useState<PendingSectionSelection | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);
  const [parseStage, setParseStage] = useState<ParseStage>('idle');
  const [parseStageProgress, setParseStageProgress] = useState(0);
  const [parseStageMessage, setParseStageMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const tenderInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { showDocumentParseNotice } = useDocumentParseNotice();
  const isBusy = busy !== null;

  useEffect(() => {
    let mounted = true;

    const loadParserConfig = async () => {
      if (!apiClient) {
        return;
      }

      try {
        const config = await apiClient.config.load();
        if (mounted) {
          setConfiguredParserLabel(parserLabels[config.file_parser.provider] || parserLabels.local);
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : '读取文件解析配置失败', 'error');
      }
    };

    loadParserConfig();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    setPendingSelection(pendingSectionSelection);
  }, [pendingSectionSelection]);

  useEffect(() => {
    if (parseStage !== 'uploading') return undefined;
    const unsubscribe = apiClient.technicalPlan.onParseEvent((event: { phase?: string; progress?: number; message?: string }) => {
      if (event?.phase === 'parsing') {
        setParseStage('parsing');
      }
      if (typeof event?.progress === 'number') {
        setParseStageProgress(Math.max(0, Math.min(100, event.progress)));
      }
      if (typeof event?.message === 'string' && event.message) {
        setParseStageMessage(event.message);
      }
    });
    return unsubscribe;
  }, [parseStage]);

  const importTenderDocument = async (file: File) => {
    if (!isWordFile(file)) {
      showToast('仅支持 .doc / .docx 文件', 'error');
      return;
    }

    try {
      setBusy('tender');
      setParseStage('uploading');
      setParseStageProgress(0);
      setParseStageMessage(`正在上传 ${file.name}`);
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.technicalPlan.importTenderDocument(formData);

      if (!result?.success) {
        const message = result?.message || '未导入文件';
        if (isLibreOfficeRequiredMessage(message)) {
          showDocumentParseNotice(message);
          setParseStage('idle');
          setParseStageMessage('');
          return;
        }
        showToast(message, message === '已取消选择' ? 'info' : 'error');
        setLastFailedFile(file);
        setParseStage('idle');
        setParseStageMessage('');
        return;
      }

      if (result.needsSectionSelection && result.sections) {
        const nextPendingSelection = {
          fileName: result.fileName || '未命名文件',
          parserLabel: result.parserLabel || undefined,
          sections: result.sections,
          totalDeclared: result.totalDeclared,
        };
        setPendingSelection(nextPendingSelection);
        if (result.state) {
          onStateChanged(result.state);
        }
        setParseStage('done');
        setParseStageMessage('等待选择投标范围');
        return;
      }

      if (!result.state || !result.markdown) {
        showToast('招标文件解析结果为空', 'error');
        setLastFailedFile(file);
        setParseStage('idle');
        setParseStageMessage('');
        return;
      }

      onFileImported(result.state, result.markdown);
      showToast(result.message || '招标文件已导入', 'success');
      setLastFailedFile(null);
      setParseStage('done');
      setParseStageProgress(100);
      setParseStageMessage('解析完成');
      window.setTimeout(() => {
        setParseStage('idle');
        setParseStageMessage('');
        setParseStageProgress(0);
      }, 800);
    } catch (error) {
      if (demoMode && file) {
        try {
          const markdown = await readFileAsMarkdown(file);
          onFileImported({ tenderFile: { fileName: file.name, markdownChars: markdown.length, parserLabel: '演示模式' } } as TechnicalPlanState, markdown);
          showToast(`演示模式：已读取 ${file.name}（未经后端解析）`, 'info');
          setLastFailedFile(null);
          setParseStage('done');
          setParseStageMessage('演示模式读取完成');
        } catch (fallbackError) {
          showToast(fallbackError instanceof Error ? fallbackError.message : '文件读取失败', 'error');
          setLastFailedFile(file);
          setParseStage('idle');
          setParseStageMessage('');
        }
        return;
      }
      const message = error instanceof Error ? error.message : '文件解析失败';
      if (isLibreOfficeRequiredMessage(message)) {
        showDocumentParseNotice(message);
        setParseStage('idle');
        setParseStageMessage('');
        return;
      }
      showToast(message, 'error');
      setLastFailedFile(file);
      setParseStage('idle');
      setParseStageMessage('');
    } finally {
      setBusy(null);
      const input = tenderInputRef.current;
      if (input) input.value = '';
    }
  };

  const triggerFilePicker = () => {
    tenderInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void importTenderDocument(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (isBusy) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    void importTenderDocument(file);
  };

  const handleRetry = () => {
    if (!lastFailedFile) return;
    void importTenderDocument(lastFailedFile);
  };

  const handleSectionSelect = async (sectionId: string) => {
    if (!pendingSelection) return;
    try {
      setBusy('section');
      const selectedSection = pendingSelection.sections.find((section) => section.id === sectionId);
      if (!selectedSection) {
        showToast('未找到选择的投标范围', 'error');
        return;
      }
      const result = await apiClient.technicalPlan.selectBidSection(selectedSection);
      if (!result?.success || !result.state || !result.markdown) {
        showToast(result?.message || '标段选择失败', 'error');
        return;
      }
      onFileImported(result.state, result.markdown);
      showToast(result.message || '已选择标段并导入招标文件', 'success');
      setPendingSelection(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '标段选择失败', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleSectionCancel = async () => {
    if (!pendingSelection) return;
    try {
      const result = await apiClient.technicalPlan.cancelBidSectionSelection();
      if (result?.state) {
        onStateChanged(result.state);
      }
    } catch {
      // 忽略取消失败
    }
    setPendingSelection(null);
  };

  const selectedSectionTitle = tenderFile?.selectedSectionTitle;
  const selectedSectionHeadLine = tenderFile?.selectedSectionHeadLine;
  const hasSectionHint = Boolean(selectedSectionTitle);
  const activeFile = tenderFile;
  const activeMarkdown = tenderMarkdown;
  const readerEmptyText = '当前步骤只负责把招标文件解析成 Markdown。下一步再基于这里的 Markdown 内容进行 AI 标书理解。';

  return (
    <div className={`plan-step-body document-analysis-page technical-document-page${hasSectionHint ? ' has-section-hint' : ''}`}>
      <section
        className={`technical-document-upload-board${isDragging ? ' is-dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="technical-document-page-title">
          <div>
            <span className="section-kicker">STEP 01</span>
            <h2>选择标书</h2>
            <p>默认解析方案：{configuredParserLabel}</p>
          </div>
        </div>

        <div className="technical-document-upload-stack">
          <article className="technical-document-upload-row">
            <div className="technical-document-upload-label">
              <span>01</span>
              <strong>招标文件</strong>
            </div>
            <div className="technical-document-upload-content">
              {tenderFile ? (
                <DocumentFilePill file={tenderFile} />
              ) : (
                <div className="technical-document-empty-upload">
                  <strong>等待招标文件</strong>
                  <span>仅支持 .doc / .docx 格式；可将文件拖入此处或点击右侧按钮上传。</span>
                </div>
              )}
            </div>
            <div className="technical-document-upload-actions">
              <button type="button" className="primary-action" onClick={triggerFilePicker} disabled={isBusy}>
                {busy === 'tender' ? '解析中...' : tenderFile ? '替换' : '上传'}
              </button>
              {lastFailedFile && !isBusy && (
                <button type="button" className="secondary-action" onClick={handleRetry}>
                  重试 {lastFailedFile.name}
                </button>
              )}
            </div>
          </article>
        </div>

        {parseStage !== 'idle' && (
          <div className="parse-progress" data-stage={parseStage}>
            <div className="parse-progress-message">
              {parseStage === 'uploading' && (parseStageMessage || `正在上传文件 (${parseStageProgress}%)`)}
              {parseStage === 'parsing' && (parseStageMessage || `AI 解析中 (${parseStageProgress}%)`)}
              {parseStage === 'done' && (parseStageMessage || '解析完成')}
            </div>
            <div className="parse-progress-bar" aria-hidden="true">
              <span style={{ width: `${parseStageProgress}%` }} />
            </div>
          </div>
        )}
      </section>

      {selectedSectionTitle && (
        <section className="analysis-section-hint">
          <strong>投标范围：</strong>
          <span>{selectedSectionTitle}</span>
          {selectedSectionHeadLine && (
            <span className="analysis-section-hint-detail">（{selectedSectionHeadLine.replace(/^.*?(?:标段|标包|分包|包)[：:]\s*/, '')}）</span>
          )}
        </section>
      )}

      <section className="technical-document-reader-card analysis-markdown-card">
        <div className="analysis-result-head technical-document-reader-head">
          <strong>招标文件内容</strong>
          <span>{activeFile ? `${activeFile.fileName} · ${activeFile.markdownChars} 字` : '等待上传'}</span>
        </div>

        {activeMarkdown ? (
          <div className="markdown-viewer">
            <MarkdownRenderer>
              {activeMarkdown}
            </MarkdownRenderer>
          </div>
        ) : (
          <div className="markdown-empty-state">
            <strong>尚未导入招标文件</strong>
            <p>{readerEmptyText}</p>
          </div>
        )}
      </section>

      <input ref={tenderInputRef} type="file" style={{ display: 'none' }} accept=".doc,.docx" onChange={handleFileInputChange} />

      <BidSectionSelectorDialog
        open={Boolean(pendingSelection)}
        sections={pendingSelection?.sections || []}
        totalDeclared={pendingSelection?.totalDeclared}
        onSelect={handleSectionSelect}
        onCancel={handleSectionCancel}
        busy={isBusy}
      />
    </div>
  );
}

export default DocumentAnalysisPage;

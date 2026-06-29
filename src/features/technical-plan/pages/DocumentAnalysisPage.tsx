import { useRef, useState } from 'react';
import { MarkdownRenderer } from '../../../shared/ui';
import type { DocumentAnalysisPageProps } from '../types';

function DocumentFilePill({ fileName, markdownChars }: { fileName: string; markdownChars: number }) {
  return (
    <div className="technical-document-file-pill">
      <div className="technical-document-file-icon">MD</div>
      <div className="technical-document-file-info">
        <strong>{fileName}</strong>
        <span>{markdownChars} 字</span>
      </div>
    </div>
  );
}

function DocumentAnalysisPage({
  tenderFile,
  tenderMarkdown,
  onFileImported,
}: DocumentAnalysisPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const tenderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const triggerFilePicker = () => {
    tenderInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileImported) {
      // Mock: 直接用文件名模拟导入
      onFileImported(
        { tenderFile: { fileName: file.name, markdownChars: 12345 } },
        `# ${file.name}\n\n这是模拟解析后的招标文件内容...`
      );
    }
  };

  return (
    <div className="plan-step-body document-analysis-page technical-document-page">
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
                <DocumentFilePill fileName={tenderFile.fileName} markdownChars={tenderFile.markdownChars} />
              ) : (
                <div className="technical-document-empty-upload">
                  <strong>等待招标文件</strong>
                  <span>仅支持 .doc / .docx 格式；可将文件拖入此处或点击右侧按钮上传。</span>
                </div>
              )}
            </div>
            <div className="technical-document-upload-actions">
              <button type="button" className="primary-action" onClick={triggerFilePicker}>
                {tenderFile ? '替换' : '上传'}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="technical-document-reader-card analysis-markdown-card">
        <div className="analysis-result-head technical-document-reader-head">
          <strong>招标文件内容</strong>
          <span>{tenderFile ? `${tenderFile.fileName} · ${tenderFile.markdownChars} 字` : '等待上传'}</span>
        </div>

        {tenderMarkdown ? (
          <div className="markdown-viewer">
            <MarkdownRenderer>
              {tenderMarkdown}
            </MarkdownRenderer>
          </div>
        ) : (
          <div className="markdown-empty-state">
            <strong>尚未导入招标文件</strong>
            <p>当前步骤只负责把招标文件解析成 Markdown。下一步再基于这里的 Markdown 内容进行 AI 标书理解。</p>
          </div>
        )}
      </section>

      <input ref={tenderInputRef} type="file" style={{ display: 'none' }} accept=".doc,.docx" onChange={handleFileInputChange} />
    </div>
  );
}

export default DocumentAnalysisPage;
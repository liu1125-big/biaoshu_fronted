/**
 * STEP 1: 上传招标文件, 解析为 Markdown
 */

import { useRef, useState } from 'react';
import { MarkdownRenderer, useToast } from '../../../shared/ui';
import { apiClient } from '../../../shared/api/apiClient';
import type { DocumentAnalysisPageProps } from '../types';

function DocumentFilePill({ fileName, markdownChars }: { fileName: string; markdownChars: number }) {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'DOC';
  return (
    <div className="technical-document-file-pill">
      <div className="technical-document-file-icon">{ext}</div>
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
  const [isConverting, setIsConverting] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const tenderInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

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

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!onFileImported) return;

    setCurrentFile(file);
    setLocalFileName(file.name);
    setIsConverting(true);
    setIsFailed(false);

    (async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await apiClient.markdown.convert(formData);
        const markdownChars = result.markdown.length;
        onFileImported({
          tenderFile: { fileName: file.name, markdownChars },
          markdown: result.markdown
        });
        setLocalFileName(null);
        setIsFailed(false);
        showToast('文档解析成功');
      } catch (err) {
        setIsFailed(true);
        showToast(err instanceof Error ? err.message : '解析失败', 'error');
      } finally {
        setIsConverting(false);
      }
    })();
  };

  const triggerFilePicker = () => {
    tenderInputRef.current?.click();
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onFileImported) return;

    setCurrentFile(file);
    setLocalFileName(file.name);
    setIsConverting(true);
    setIsFailed(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.markdown.convert(formData);
      const markdownChars = result.markdown.length;
      onFileImported({
        tenderFile: { fileName: file.name, markdownChars },
        markdown: result.markdown
      });
      setLocalFileName(null);
      setIsFailed(false);
      showToast('文档解析成功');
    } catch (err) {
      setIsFailed(true);
      showToast(err instanceof Error ? err.message : '解析失败', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  const handleRetry = async () => {
    if (!currentFile || !onFileImported) return;
    setIsConverting(true);
    setIsFailed(false);
    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      const result = await apiClient.markdown.convert(formData);
      const markdownChars = result.markdown.length;
      onFileImported({
        tenderFile: { fileName: currentFile.name, markdownChars },
        markdown: result.markdown
      });
      setLocalFileName(null);
      setIsFailed(false);
      showToast('文档解析成功');
    } catch (err) {
      setIsFailed(true);
      showToast(err instanceof Error ? err.message : '解析失败', 'error');
    } finally {
      setIsConverting(false);
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
              {localFileName || tenderFile ? (
                <DocumentFilePill fileName={localFileName || tenderFile?.fileName || ''} markdownChars={tenderFile?.markdownChars ?? 0} />
              ) : (
                <div className="technical-document-empty-upload">
                  <strong>等待招标文件</strong>
                  <span>仅支持 .doc / .docx 格式；可将文件拖入此处或点击右侧按钮上传。</span>
                </div>
              )}
            </div>
            <div className="technical-document-upload-actions">
              <button type="button" className="primary-action" onClick={triggerFilePicker} disabled={isConverting}>
                {isConverting ? '解析中...' : tenderFile ? '替换' : '上传'}
              </button>
              {isFailed && (
                <button type="button" className="primary-action" onClick={handleRetry}>
                  重试
                </button>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="technical-document-reader-card analysis-markdown-card">
        <div className="analysis-result-head technical-document-reader-head">
          <strong>招标文件内容</strong>
          <span>{tenderFile ? `${tenderFile.fileName} · ${tenderFile.markdownChars} 字` : '等待上传'}</span>
        </div>

        {isConverting ? (
          <div className="markdown-empty-state">
            <strong>正在解析文档...</strong>
            <p>请稍候，文档转换需要一些时间</p>
          </div>
        ) : isFailed ? (
          <div className="markdown-empty-state">
            <strong>解析失败</strong>
            <p>文档解析失败，请检查文件格式或网络连接后重试</p>
          </div>
        ) : tenderMarkdown ? (
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
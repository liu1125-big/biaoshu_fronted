/**
 * 文档敏感信息脱敏页面
 * 包含mock演示数据
 */

import { useEffect, useRef, useState } from 'react';
import { MarkdownRenderer, useToast } from '../../../shared/ui';
import type { AnonymizationOption } from '../types';

const DEFAULT_OPTIONS: AnonymizationOption[] = [
  { id: 'company_name', label: '公司名称', description: '替换为公司简称', enabled: true },
  { id: 'person_name', label: '人名', description: '替换为"某先生/女士"', enabled: true },
  { id: 'phone', label: '电话号码', description: '隐藏真实电话号码', enabled: true },
  { id: 'id_card', label: '身份证号', description: '隐藏身份证号码', enabled: true },
  { id: 'address', label: '地址', description: '替换为"***市"', enabled: false },
  { id: 'bank_account', label: '银行账号', description: '隐藏银行账号', enabled: false },
];

const MOCK_MARKDOWN = `# 匿名化处理后的文档

## 基本信息

- **公司名称**: 某某有限公司（原：ABC建设集团有限公司）
- **项目名称**: 某市某区某道路工程
- **招标编号**: ZB-2024-****

## 联系方式

- **联系人**: 某先生
- **联系电话**: 138****1234
- **联系地址**: 某省某市某区某路***号

## 投标单位信息

| 序号 | 单位名称 | 资质等级 |
|------|----------|----------|
| 1 | 某建设集团有限公司 | 一级 |
| 2 | 某建筑工程有限公司 | 二级 |

## 备注

以上信息已按要求进行匿名化处理。

> 原始文档包含 15 处敏感信息，已处理 12 处，保留 3 处（用户未选中）。`;

export default function AnonymousPage() {
  useEffect(() => { document.title = '匿名化工具'; }, []);

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<{ fileName: string; charCount: number } | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [options, setOptions] = useState<AnonymizationOption[]>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const toggleOption = (id: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'doc' && ext !== 'docx') {
      showToast('仅支持 .doc / .docx 格式文件', 'error');
      return;
    }
    setFile({ fileName: f.name, charCount: 0 });
    setMarkdown('');
    showToast(`已选择文件: ${f.name}`, 'success');
  };

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
    const f = files[0];
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'doc' && ext !== 'docx') {
      showToast('仅支持 .doc / .docx 格式文件', 'error');
      return;
    }
    setFile({ fileName: f.name, charCount: 0 });
    setMarkdown('');
    showToast(`已选择文件: ${f.name}`, 'success');
  };

  const handleAnonymize = async () => {
    if (!file) {
      showToast('请先上传文件', 'info');
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMarkdown(MOCK_MARKDOWN);
    setIsProcessing(false);
    showToast('匿名化处理完成', 'success');
  };

  const handleExport = () => {
    if (!markdown) {
      showToast('没有可导出的内容', 'info');
      return;
    }
    showToast('导出功能（待后端实现）', 'info');
  };

  return (
    <div className="page-stack anonymous-page">
      {/* 顶栏 */}
      <section className="knowledge-workspace-bar">
        <div className="knowledge-breadcrumb">
          <strong className="knowledge-breadcrumb-title">匿名化工具</strong>
          <div className="knowledge-breadcrumb-desc">
            <span>上传文档，一键去除敏感信息</span>
          </div>
        </div>
        <div className="knowledge-toolbar-actions">
          <button type="button" className="primary-action" onClick={handleExport} disabled={!markdown}>
            {markdown ? '导出' : '导出'}
          </button>
        </div>
      </section>

      <section className="anonymous-layout">
        {/* 左侧：上传和配置 */}
        <aside className="anonymous-config-panel">
          <div
            className={`anonymous-upload-area${isDragging ? ' is-dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input ref={fileInputRef} type="file" accept=".doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
            {file ? (
              <div className="anonymous-file-info">
                <span className="anonymous-file-icon">DOC</span>
                <div>
                  <strong>{file.fileName}</strong>
                  <small>{file.charCount > 0 ? `${file.charCount} 字` : '已上传'}</small>
                </div>
              </div>
            ) : (
              <div className="anonymous-upload-hint">
                <strong>点击或拖拽上传文件</strong>
                <small>支持 .doc / .docx 格式</small>
              </div>
            )}
          </div>

          <div className="anonymous-options">
            <div className="anonymous-options-header">
              <strong>匿名化配置</strong>
              <span>{options.filter((o) => o.enabled).length} 项已选</span>
            </div>
            <div className="anonymous-options-list">
              {options.map((opt) => (
                <label key={opt.id} className={`anonymous-option${opt.enabled ? ' is-enabled' : ''}`}>
                  <input type="checkbox" checked={opt.enabled} onChange={() => toggleOption(opt.id)} />
                  <div className="anonymous-option-info">
                    <strong>{opt.label}</strong>
                    <small>{opt.description}</small>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="button" className="primary-action anonymous-start-btn" onClick={handleAnonymize} disabled={!file || isProcessing}>
            {isProcessing ? '处理中...' : '开始匿名化'}
          </button>
        </aside>

        {/* 右侧：预览 */}
        <main className="anonymous-preview-panel">
          <div className="knowledge-panel-head">
            <strong>预览结果</strong>
            {markdown && <span>已处理</span>}
          </div>
          {markdown ? (
            <div className="anonymous-markdown-content">
              <MarkdownRenderer>{markdown}</MarkdownRenderer>
            </div>
          ) : (
            <div className="knowledge-empty-box large">
              <strong>暂无预览内容</strong>
              <p>上传文件并点击"开始匿名化"后，预览结果将显示在这里。</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

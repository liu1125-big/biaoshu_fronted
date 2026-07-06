/**
 * 通用 Dialog 弹窗组件
 * 基于 Radix UI Dialog，提供统一的弹窗样式
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface DialogField {
  label: string;
  value: string;
  setValue: (value: string) => void;
  type?: 'text' | 'password' | 'tel' | 'email';
  placeholder?: string;
}

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  kicker?: string;
  fields?: DialogField[];
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  maxWidth?: number | string;
  children?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  kicker,
  fields = [],
  inputClassName = '',
  inputStyle,
  maxWidth,
  children,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
}: BaseDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="content-regenerate-modal" />
        <DialogPrimitive.Content
          className="project-dialog-card"
          style={{
            maxHeight: 'calc(100vh - 60px)',
            ...(maxWidth ? { maxWidth, width: 'calc(100vw - 40px)' } : {}),
          }}
        >
          <div className="knowledge-migration-head" style={children ? { marginBottom: 12 } : undefined}>
            {kicker && <span className="section-kicker">{kicker}</span>}
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
          </div>

          {(fields.length > 0 || children) && (
            <div className="project-dialog-body" style={children ? { marginBottom: 16 } : undefined}>
              {fields.map((field) => (
                <label key={field.label} className="project-dialog-field" style={{ marginTop: field.label ? 10 : 0 }}>
                  {field.label && <span>{field.label}</span>}
                  <input
                    type={field.type || 'text'}
                    className={inputClassName}
                    placeholder={field.placeholder}
                    style={{ marginTop: field.label ? 6 : 0, height: 44, ...inputStyle }}
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                  />
                </label>
              ))}
              {children}
            </div>
          )}

          <div className="content-regenerate-actions">
            <button type="button" className="secondary-action" onClick={handleCancel}>
              {cancelText}
            </button>
            {onConfirm && (
              <button type="button" className="primary-action" onClick={handleConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default Dialog;

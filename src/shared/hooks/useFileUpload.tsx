import { useRef, useCallback } from 'react';

interface UseFileUploadOptions {
  accept?: string;
  multiple?: boolean;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolveRef = useRef<((file: File | null) => void) | null>(null);

  const openFileDialog = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      inputRef.current?.click();
    });
  }, []);

  const getFile = useCallback((): File | undefined => {
    return inputRef.current?.files?.[0] || undefined;
  }, []);

  const clearFiles = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (resolveRef.current) {
      resolveRef.current(file);
      resolveRef.current = null;
    }
  }, []);

  const FileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={options.accept}
      multiple={options.multiple}
      style={{ display: 'none' }}
      onChange={handleChange}
    />
  );

  return { openFileDialog, getFile, clearFiles, FileInput };
}

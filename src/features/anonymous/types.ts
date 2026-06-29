export interface AnonymizationOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AnonymizationResult {
  markdown: string;
  fileName: string;
}

export interface AnonymousState {
  file: { fileName: string; charCount: number } | null;
  markdown: string;
  options: AnonymizationOption[];
  isProcessing: boolean;
}

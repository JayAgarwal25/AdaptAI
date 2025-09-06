export type OutputType = 'summary' | 'notes' | 'quiz' | 'video';

export interface HistoryItem {
  id: string;
  timestamp: string;
  input: {
    content: string;
    outputType: OutputType;
    language: string;
  };
  output: {
    success: boolean;
    data?: any;
    error?: string;
    outputType: OutputType;
  };
}

export interface TranslationResult {
  vietnamese: string;
  german: string;
  pronunciation: string;
  breakdown: string; // Markdown formatted feedback
  loading?: boolean;
}

export interface FeedbackResult {
  isCorrect: boolean;
  score: number; // 0 to 100
  userTranslation: string;
  correctTranslation: string;
  pronunciation: string;
  explanation: string; // Markdown formatted feedback on errors
}

export interface QuizSession {
  vietnamesePrompt: string;
  userAttempt?: string;
  feedback?: FeedbackResult;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'translation' | 'quiz';
  data: TranslationResult | FeedbackResult;
}

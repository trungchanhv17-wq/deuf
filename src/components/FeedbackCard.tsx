import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TranslationResult, FeedbackResult } from '../types';
import { Volume2, Info, BookOpen, Quote, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface FeedbackCardProps {
  result: TranslationResult | FeedbackResult;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ result }) => {
  const isQuiz = 'score' in result;

  if (isQuiz) {
    const feedback = result as FeedbackResult;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto space-y-6"
      >
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center ${feedback.score >= 80 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
              <Trophy size={20} className="mb-1" />
              <span className="text-2xl font-black">{feedback.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Điểm</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? (
                <CheckCircle2 className="text-green-500" size={24} />
              ) : (
                <XCircle className="text-red-500" size={24} />
              )}
              <h3 className="text-xl font-bold text-gray-900">
                {feedback.isCorrect ? 'Tuyệt vời! Bạn đã dịch đúng.' : feedback.score >= 50 ? 'Gần đúng rồi, cố gắng lên!' : 'Cần chú ý thêm một chút nhé.'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bài làm của bạn</span>
                <p className="text-gray-900 font-medium">{feedback.userTranslation}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-2">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Đáp án gợi ý</span>
                <p className="text-orange-900 font-bold">{feedback.correctTranslation}</p>
                <div className="flex items-center gap-2 text-orange-600 font-mono text-xs">
                  <Volume2 size={14} />
                  <span>[{feedback.pronunciation}]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-semibold">
            <BookOpen size={18} className="text-orange-500" />
            <span>Nhận xét chi tiết từ AI</span>
          </div>
          <div className="p-6">
            <div className="prose prose-sm prose-orange max-w-none prose-p:leading-relaxed prose-li:my-1">
              <ReactMarkdown>{feedback.explanation}</ReactMarkdown>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const translation = result as TranslationResult;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Primary Result Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-gray-400">
              <Quote size={16} className="rotate-180" />
              <span className="text-sm font-medium italic">{translation.vietnamese}</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                {translation.german}
              </h2>
              <div className="flex items-center gap-3 text-gray-500 font-mono text-sm group cursor-pointer hover:text-orange-500 transition-colors">
                <Volume2 size={16} />
                <span>[{translation.pronunciation}]</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-2xl">
            <div className="text-orange-600 font-bold text-xs uppercase tracking-widest text-center">DE</div>
          </div>
        </div>
      </div>

      {/* AI Breakdown Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-semibold">
          <BookOpen size={18} className="text-orange-500" />
          <span>Phân tích cấu trúc & Từ vựng</span>
        </div>
        <div className="p-6">
          <div className="prose prose-sm prose-orange max-w-none prose-p:leading-relaxed prose-li:my-1">
            <ReactMarkdown>{translation.breakdown}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-3xl p-6 flex items-start gap-4 ring-1 ring-orange-200/50">
        <div className="bg-orange-200 p-2 rounded-xl text-orange-700">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide">Mẹo học từ AI</h4>
          <p className="text-orange-800 text-sm leading-relaxed">
            Bạn có biết? Trong tiếng Đức, động từ luôn đứng ở vị trí thứ 2 trong câu khẳng định chính. Hãy nhớ quy tắc này để không bao giờ sai cấu trúc nhé!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

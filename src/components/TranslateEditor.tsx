import React, { useState } from 'react';
import { Send, Languages, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface TranslateEditorProps {
  onTranslate: (text: string) => void;
  isLoading: boolean;
  prompt?: string;
  onRefreshPrompt?: () => void;
}

export const TranslateEditor: React.FC<TranslateEditorProps> = ({ onTranslate, isLoading, prompt, onRefreshPrompt }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onTranslate(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      {prompt && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Câu hỏi dành cho bạn</span>
            <p className="text-lg font-semibold text-orange-900">{prompt}</p>
          </div>
          {onRefreshPrompt && (
            <button 
              type="button"
              onClick={onRefreshPrompt}
              className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
              title="Đổi câu khác"
            >
              <Sparkles size={18} />
            </button>
          )}
        </motion.div>
      )}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
              <Languages size={16} />
              <span>{prompt ? 'Bản dịch Tiếng Đức của bạn' : 'Dịch từ Tiếng Việt'}</span>
            </div>
            <div className="ml-auto text-[10px] text-gray-400 font-mono">
              CMD + ENTER TO SEND
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={prompt ? "Nhập bản dịch tiếng Đức của bạn vào đây..." : "Nhập câu tiếng Việt bạn muốn dịch..."}
            className="w-full h-32 p-4 text-lg text-gray-800 placeholder-gray-300 resize-none focus:outline-none bg-transparent"
            disabled={isLoading}
          />
          
          <div className="flex justify-end p-3 bg-gray-50/50 border-t border-gray-100">
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                !text.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/5 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  <span>Đang phân tích...</span>
                </>
              ) : (
                <>
                  <span>Gửi câu hỏi</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

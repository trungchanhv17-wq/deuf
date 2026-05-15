import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ai = React.useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({ 
        model: "gemini-1.5-flash",
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "Bạn là trợ lý ảo của ứng dụng DeutschLernen. Hãy hỗ trợ người dùng học tiếng Đức và giải đáp thắc mắc về ứng dụng. Trả lời ngắn gọn, thân thiện."
        },
      });

      const responseText = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
      setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI. Bạn vui lòng thử lại sau nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100]"
      >
        <MessageSquare size={24} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">AI</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] z-[110] flex flex-col pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full h-full sm:rounded-[32px] shadow-2xl shadow-black/20 border border-gray-100 flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="bg-black p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">AI Trợ Lý</h3>
                    <p className="text-[10px] text-white/60 font-medium">Sẵn sàng hỗ trợ bạn 24/7</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6 opacity-40">
                    <HelpCircle size={48} className="text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Chào bạn!</p>
                      <p className="text-xs">Bạn có câu hỏi gì về tiếng Đức hay tính năng của app không?</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-black text-white rounded-br-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-2">
                      <Loader2 className="animate-spin text-orange-500" size={16} />
                      <span className="text-xs text-gray-400 font-medium italic">Gemini đang trả lời...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Hỏi AI bất cứ điều gì..."
                    className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-black transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-black text-white rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-20"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

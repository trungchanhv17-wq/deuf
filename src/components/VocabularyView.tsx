import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Layers, Filter, ChevronRight, Star, PlayCircle } from 'lucide-react';

interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
  level: 'A1' | 'A2' | 'B1';
  category: string;
}

const mockVocab: VocabularyItem[] = [
  { word: 'Guten Tag!', meaning: 'Chào buổi ngày (lịch sự)', example: 'Guten Tag, Herr Müller!', level: 'A1', category: 'Chào hỏi' },
  { word: 'das Haus', meaning: 'Ngôi nhà', example: 'Das Haus ist groß.', level: 'A1', category: 'Nhà cửa' },
  { word: 'vielleicht', meaning: 'Có lẽ', example: 'Vielleicht kommen wir morgen.', level: 'A2', category: 'Giao tiếp' },
  { word: 'đặc biệt (besonders)', meaning: 'đặc biệt', example: 'Das ist besonders wichtig.', level: 'B1', category: 'Tính từ' },
  { word: 'die Umwelt', meaning: 'Môi trường', example: 'Wir schützen die Umwelt.', level: 'B1', category: 'Xã hội' },
  { word: 'der Beruf', meaning: 'Nghề nghiệp', example: 'Was ist dein Beruf?', level: 'A1', category: 'Công việc' },
  { word: 'đặt hàng (bestellen)', meaning: 'đặt hàng', example: 'Ich möchte eine Pizza bestellen.', level: 'A2', category: 'Mua sắm' },
  { word: 'quyết định (entscheiden)', meaning: 'quyết định', example: 'Ich kann mich nicht entscheiden.', level: 'B1', category: 'Động từ' },
];

export const VocabularyView: React.FC = () => {
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'All'>('All');
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);

  const filtered = level === 'All' ? mockVocab : mockVocab.filter(v => v.level === level);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <BookOpen className="text-orange-500" />
            Kho Từ Vựng
          </h2>
          <p className="text-gray-500 text-sm">Chinh phục 3000+ từ vựng thông dụng theo trình độ.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          {['All', 'A1', 'A2', 'B1'].map(l => (
            <button
              key={l}
              onClick={() => setLevel(l as any)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${level === l ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedWord(item)}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black tracking-widest uppercase ${
              item.level === 'A1' ? 'bg-green-100 text-green-600' : 
              item.level === 'A2' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {item.level}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors italic">{item.word}</h3>
              </div>
              
              <div className="h-px bg-gray-50 w-full" />
              
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{item.meaning}</p>
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
                  <PlayCircle size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl p-10 space-y-8"
            >
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedWord.level}</span>
                    <h2 className="text-4xl font-black italic text-gray-900">{selectedWord.word}</h2>
                  </div>
                  <button onClick={() => setSelectedWord(null)} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                    <Layers className="text-gray-400 hover:text-black" />
                  </button>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nghĩa tiếng Việt</p>
                   <p className="text-xl font-bold text-gray-800">{selectedWord.meaning}</p>
                 </div>

                 <div className="space-y-2">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ví dụ (Beispiel)</p>
                   <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                     <p className="text-blue-900 font-medium leading-relaxed italic">"{selectedWord.example}"</p>
                   </div>
                 </div>
               </div>

               <button 
                 className="w-full bg-black text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition-all"
                 onClick={() => setSelectedWord(null)}
               >
                 <Star size={18} className="text-orange-400 fill-orange-400" />
                 Lưu vào Flashcards
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

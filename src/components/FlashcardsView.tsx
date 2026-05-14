import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, XCircle, Trophy, Layers } from 'lucide-react';

const cards = [
  { front: 'Haus', back: 'Ngôi nhà', level: 'A1' },
  { front: 'Tisch', back: 'Cái bàn', level: 'A1' },
  { front: 'Umwelt', back: 'Môi trường', level: 'B1' },
  { front: 'Vielleicht', back: 'Có lẽ', level: 'A2' },
];

export const FlashcardsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ known: 0, unknown: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = (known: boolean) => {
    setScore(s => ({
      known: known ? s.known + 1 : s.known,
      unknown: !known ? s.unknown + 1 : s.unknown
    }));
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ known: 0, unknown: 0 });
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center text-orange-500 shadow-xl shadow-orange-500/10">
          <Trophy size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Hoàn thành buổi học!</h2>
          <p className="text-gray-500">Bạn đã ôn tập xong các thẻ từ vựng ngày hôm nay.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
            <p className="text-3xl font-black text-green-600">{score.known}</p>
            <p className="text-[10px] text-green-700 font-black uppercase tracking-widest">Đã thuộc</p>
          </div>
          <div className="bg-red-50 p-4 rounded-3xl border border-red-100">
            <p className="text-3xl font-black text-red-600">{score.unknown}</p>
            <p className="text-[10px] text-red-700 font-black uppercase tracking-widest">Cần xem lại</p>
          </div>
        </div>

        <button 
          onClick={restart}
          className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-3xl font-bold hover:bg-gray-900 transition-all shadow-xl shadow-black/10"
        >
          <RefreshCw size={20} />
          Học lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-8 max-w-2xl mx-auto space-y-12 justify-center">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-4">
          <Layers className="text-orange-500" />
          Flashcards
        </h2>
        <p className="text-gray-500 text-sm font-medium">Tiến trình: {currentIndex + 1} / {cards.length}</p>
      </div>

      <div className="perspective-1000 h-96 w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div 
          className="relative w-full h-full transition-all duration-700 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-10 space-y-4">
            <span className="bg-gray-100 px-4 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentCard.level}</span>
            <p className="text-6xl font-black text-gray-900 italic text-center tracking-tighter">{currentCard.front}</p>
            <p className="text-xs text-blue-500 font-bold animate-bounce mt-8">Nhấn để xem nghĩa</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-orange-500 border-2 border-orange-400 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-10 space-y-4 rotate-y-180">
            <p className="text-sm font-black text-white/60 uppercase tracking-widest">NGHĨA LÀ</p>
            <p className="text-6xl font-black text-white italic text-center tracking-tighter">{currentCard.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="w-20 h-20 bg-white border-2 border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-500 transition-all shadow-lg active:scale-95"
        >
          <XCircle size={32} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="w-20 h-20 bg-white border-2 border-green-100 text-green-500 rounded-full flex items-center justify-center hover:bg-green-50 hover:border-green-500 transition-all shadow-lg active:scale-95"
        >
          <CheckCircle2 size={32} />
        </button>
      </div>
    </div>
  );
};

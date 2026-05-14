import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Search, Video, Loader2, Music, Type, Languages, FastForward, Rewind, Sparkles } from 'lucide-react';

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export const ShadowingView: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleFetch = async (inputUrl?: string) => {
    const finalUrl = inputUrl || url;
    const id = extractVideoId(finalUrl);
    if (!id) {
      setError("Link YouTube không hợp lệ.");
      return;
    }

    setVideoId(id);
    setIsLoading(true);
    setError(null);
    setTranscript([]);

    try {
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(finalUrl)}`);
      const data = await response.json();

      if (response.ok) {
        setTranscript(data);
      } else {
        setError(data.error || "Không thể tải phụ đề cho video này.");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleVideos = [
    { title: "Học tiếng Đức Giao tiếp", url: "https://www.youtube.com/watch?v=VsK5Yo_YvTY" },
    { title: "Tiếng Đức cho người mới", url: "https://www.youtube.com/watch?v=6kaXmNalX0k" },
    { title: "Ngữ pháp tiếng Đức", url: "https://www.youtube.com/watch?v=0hV9M78_Ots" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest">
          Luyện Shadowing
        </div>
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Cải thiện phát âm với Video</h2>
        <p className="text-gray-500 max-w-xl mx-auto italic">
          Dán link YouTube (tiếng Đức/Việt) để lấy phụ đề và luyện nói theo.
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {sampleVideos.map((video, i) => (
            <button 
              key={i}
              onClick={() => { setUrl(video.url); handleFetch(video.url); }}
              className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-black hover:text-white hover:border-black transition-all"
            >
              # {video.title}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-black/5 border border-gray-100">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Dán link YouTube vào đây... (ví dụ: https://www.youtube.com/watch?v=...)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <button 
            onClick={() => handleFetch()}
            disabled={isLoading || !url}
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            <span>Bắt đầu</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm font-medium border border-red-100"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Player */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl relative">
            {videoId ? (
              <iframe 
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 space-y-4">
                <div className="w-16 h-16 border-4 border-white/10 rounded-full flex items-center justify-center">
                  <Play size={32} />
                </div>
                <p className="text-sm font-medium">Chưa có video được tải</p>
              </div>
            )}
          </div>
          
          <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
            <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
              <Sparkles size={18} />
              <span>Mẹo học Shadowing:</span>
            </h4>
            <ul className="text-sm text-orange-700/80 space-y-2 list-disc list-inside">
              <li>Nghe 1 câu rồi dừng lại, lặp lại chính xác ngữ điệu.</li>
              <li>Sử dụng phím tắt (J/L) trên YouTube để tua 10 giây.</li>
              <li>Chỉnh tốc độ phát 0.75x nếu video quá nhanh.</li>
            </ul>
          </div>
        </div>

        {/* Subtitles */}
        <div className="bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Type size={18} />
              <span>Phụ đề</span>
            </h3>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
              {transcript.length} dòng
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {transcript.length > 0 ? (
              transcript.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-500 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-gray-400">
                      {Math.floor(item.offset / 60)}:{(item.offset % 60).toString().padStart(2, '0')}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-orange-500 transition-opacity">
                      <Play size={12} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {item.text.replace(/&amp;#39;/g, "'").replace(/&quot;/g, '"')}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                <Languages size={48} />
                <p className="text-sm">Phụ đề sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

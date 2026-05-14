import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TranslateEditor } from './components/TranslateEditor';
import { FeedbackCard } from './components/FeedbackCard';
import { AdminDashboard } from './components/AdminDashboard';
import { Pricing } from './components/Pricing';
import { AdminLogin } from './components/AdminLogin';
import { VocabularyView } from './components/VocabularyView';
import { FlashcardsView } from './components/FlashcardsView';
import { HistoryItem, TranslationResult, FeedbackResult } from './types';
import { translateToGerman, generateQuizPrompt, checkTranslation } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X, GraduationCap, Zap, Book, ShieldCheck, LogIn, User as UserIcon, LogOut, Crown, Layers, MoreHorizontal, Play } from 'lucide-react';
import { auth, signInWithGoogle, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  limit,
  deleteDoc,
  getDocs
} from 'firebase/firestore';

import { AIAssistant } from './components/AIAssistant';
import { ShadowingView } from './components/ShadowingView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<TranslationResult | FeedbackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [mode, setMode] = useState<'translation' | 'quiz' | 'vocab' | 'flashcards' | 'shadowing'>('translation');
  const [quizPrompt, setQuizPrompt] = useState<string>('');

  const menuItems = [
    { id: 'translation', label: 'Dịch', icon: Zap },
    { id: 'quiz', label: 'Luyện', icon: Book },
    { id: 'vocab', label: 'Từ vựng', icon: GraduationCap },
    { id: 'flashcards', label: 'Thẻ từ', icon: Layers },
    { id: 'shadowing', label: 'Shadowing', icon: Play },
  ];

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user doc
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const newUserData = {
              email: currentUser.email,
              isPremium: false,
              role: 'user',
              createdAt: Date.now()
            };
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
          } else {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error("User doc error:", error);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync history (separate effect for clean unsubscription)
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'history'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem)));
    }, (error) => {
      // Don't report if it's just a permission error after logout (should be handled by unmount but defensive)
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'history');
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => signOut(auth);

  // Secret shortcut for Admin: Click logo 5 times
  const [clickCount, setClickCount] = useState(0);

  const handleAdminClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setClickCount(0);
    }
  };

  // Load history and initial quiz prompt
  useEffect(() => {
    const saved = localStorage.getItem('deutsch-history-v2');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleModeSwitch = async (newMode: 'translation' | 'quiz' | 'vocab' | 'flashcards' | 'shadowing') => {
    setMode(newMode);
    setCurrentResult(null);
    if (newMode === 'quiz' && !quizPrompt) {
      refreshQuiz();
    }
  };

  const refreshQuiz = async () => {
    setIsLoading(true);
    try {
      const prompt = await generateQuizPrompt();
      setQuizPrompt(prompt);
      setCurrentResult(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (text: string) => {
    setIsLoading(true);
    setCurrentResult(null);
    try {
      if (mode === 'translation') {
        const result = await translateToGerman(text);
        setCurrentResult(result);
        addToHistory('translation', result);
      } else {
        const feedback = await checkTranslation(quizPrompt, text);
        setCurrentResult(feedback);
        addToHistory('quiz', feedback);
      }
    } catch (error: any) {
      console.error("Action Error:", error);
      let message = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      
      if (error?.message?.includes("403") || error?.message?.includes("PERMISSION_DENIED")) {
        message = "Lỗi xác thực (403). Vui lòng kiểm tra API Key trong phần Settings > Secrets.";
      } else if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
        message = "Hết hạn mức sử dụng (429). Vui lòng thử lại sau hoặc nâng cấp gói API.";
      } else if (error?.message?.includes("404") || error?.message?.includes("NOT_FOUND")) {
        message = "Không tìm thấy model (404). Đang kiểm tra lại cấu hình hệ thống.";
      }
      
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = async (type: 'translation' | 'quiz', data: TranslationResult | FeedbackResult) => {
    if (!user) {
      // Temporary fallback for guest users
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type,
        data
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50));
      return;
    }

    try {
      await addDoc(collection(db, 'history'), {
        userId: user.uid,
        timestamp: Date.now(),
        type,
        data
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'history');
    }
  };

  const clearHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      try {
        const q = query(collection(db, 'history'), where('userId', '==', user.uid));
        const snapshots = await getDocs(q);
        const deletePromises = snapshots.docs.map(d => deleteDoc(doc(db, 'history', d.id)));
        await Promise.all(deletePromises);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'history');
      }
    }
  };

  const selectFromHistory = (item: HistoryItem) => {
    setMode(item.type);
    setCurrentResult(item.data);
    if (item.type === 'quiz') {
      // In history view, we might not have the original prompt context visible in the same way,
      // but the result itself contains user and correct translations.
      setQuizPrompt(''); 
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans selection:bg-orange-100 overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      <div className={`fixed md:relative inset-y-0 left-0 z-50 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0 w-80 opacity-100' : '-translate-x-full w-0 opacity-0 md:opacity-100 md:-translate-x-full'}`}>
        <div className="w-80 h-full overflow-hidden">
          <Sidebar 
            history={history.map(h => ({
              id: h.id,
              vietnamese: h.type === 'translation' ? (h.data as TranslationResult).vietnamese : "Quiz: " + (h.data as FeedbackResult).userTranslation,
              german: h.type === 'translation' ? (h.data as TranslationResult).german : (h.data as FeedbackResult).correctTranslation,
            }))} 
            onSelect={(h) => selectFromHistory(history.find(original => original.id === h.id)!)} 
            onClear={clearHistory}
            selectedId={undefined}
            menuItems={menuItems}
            currentMode={mode}
            onModeSelect={(newMode) => {
              handleModeSwitch(newMode);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
          />
        </div>
      </div>

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AnimatePresence>
          {showPricing && <Pricing onClose={() => setShowPricing(false)} />}
          {showAdminLogin && (
            <AdminLogin 
              onSuccess={() => {
                setShowAdminLogin(false);
                setShowAdmin(true);
              }} 
              onClose={() => setShowAdminLogin(false)} 
            />
          )}
          {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        </AnimatePresence>

        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={handleAdminClick}>
              <div className="bg-black text-white p-2 rounded-xl group-hover:bg-orange-500 transition-colors">
                <GraduationCap size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 text-sm sm:text-xl">
                Deutsch<span className="text-orange-500">Lernen</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {userData?.isPremium ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-bold text-xs sm:text-sm shadow-sm ring-1 ring-orange-200">
                <Crown size={14} className="fill-orange-600" />
                <span className="hidden sm:inline">Premium</span>
              </div>
            ) : (
              <button 
                onClick={() => setShowPricing(true)}
                className="bg-orange-500 px-4 py-2 rounded-full text-white hover:bg-orange-600 transition-all flex items-center gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Nâng cấp Pro</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200 hover:border-orange-500 transition-colors cursor-pointer" title={user.email || ''}>
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition-all flex items-center gap-2 text-xs sm:text-sm font-bold"
              >
                <LogIn size={14} />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto w-full px-6 py-8">
          {mode === 'vocab' ? (
            <VocabularyView />
          ) : mode === 'flashcards' ? (
            <FlashcardsView />
          ) : mode === 'shadowing' ? (
            <ShadowingView />
          ) : (
            <div className="max-w-4xl mx-auto space-y-12">
              {!currentResult && !isLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-12">
                  <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest ">
                    {mode === 'translation' ? 'Dịch thuật thông minh' : 'Thử thách dịch thuật'}
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tighter">
                    {mode === 'translation' ? (
                      <>Nói câu Tiếng Việt,<br />Nhận ngay Tiếng Đức.</>
                    ) : (
                      <>Tự mình dịch câu,<br />AI sẽ nhận xét.</>
                    )}
                  </h2>
                  <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    {mode === 'translation' ? 'Dịch mọi ý tưởng của bạn sang tiếng Đức chuẩn xác.' : 'Nhận một câu tiếng Việt và thử sức dịch sang tiếng Đức nhé!'}
                  </p>
                </motion.div>
              )}

              <TranslateEditor 
                onTranslate={handleAction} 
                isLoading={isLoading} 
                prompt={mode === 'quiz' ? quizPrompt : undefined}
                onRefreshPrompt={refreshQuiz}
              />

              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center pt-20 space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                      </div>
                      <div className="text-center text-gray-500 animate-pulse font-medium">
                        Gemini đang làm việc...
                      </div>
                    </motion.div>
                  ) : currentResult && (
                    <FeedbackCard key="result" result={currentResult} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
      <AIAssistant />
    </div>
  );
}

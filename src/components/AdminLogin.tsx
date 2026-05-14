import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'admin@2026') {
      onSuccess();
    } else {
      setError(true);
      setPass('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <Lock size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black">Xác thực Admin</h3>
            <p className="text-xs text-gray-500">Vui lòng nhập mã bảo mật để tiếp tục</p>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className={`relative transition-all ${error ? 'animate-shake' : ''}`}>
              <input 
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Mật khẩu quản trị..."
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-100 focus:border-red-500'}`}
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              <span>Vào Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {error && <p className="text-xs text-red-500 font-bold">Mật khẩu không chính xác!</p>}
        </div>
      </motion.div>
    </div>
  );
};

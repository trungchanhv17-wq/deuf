import React from 'react';
import { HistoryItem } from '../types';
import { History, Trash2, MessageSquare, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SidebarItem {
  id: string;
  vietnamese: string;
  german: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  history: SidebarItem[];
  onSelect: (item: SidebarItem) => void;
  onClear: () => void;
  selectedId?: string;
  menuItems?: NavItem[];
  currentMode?: string;
  onModeSelect?: (id: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  history, 
  onSelect, 
  onClear, 
  selectedId, 
  menuItems, 
  currentMode, 
  onModeSelect 
}) => {
  return (
    <div className="w-80 h-full border-r border-gray-200 bg-gray-50 flex flex-col">
      {/* App Navigation */}
      {menuItems && onModeSelect && (
        <div className="p-4 border-b border-gray-200 space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onModeSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${
                currentMode === item.id 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-bottom border-gray-200 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-gray-900 font-semibold px-2">
          <History size={16} className="text-gray-400" />
          <span className="text-sm">Lịch sử học tập</span>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Xóa tất cả"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm italic">
              Chưa có lịch sử câu dịch.
            </div>
          ) : (
            history.map((item) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelect(item)}
                className={`w-full text-left p-3 rounded-lg transition-all group relative ${
                  selectedId === item.id 
                    ? 'bg-white shadow-sm ring-1 ring-gray-200' 
                    : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-900 truncate pr-4">
                    {item.vietnamese}
                  </span>
                  <span className="text-xs text-gray-500 truncate italic">
                    {item.german}
                  </span>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageSquare size={14} className="text-gray-300" />
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 border-t border-gray-200 text-[10px] text-gray-400 uppercase tracking-widest font-bold text-center">
        DeutschLernen AI v1.0
      </div>
    </div>
  );
};

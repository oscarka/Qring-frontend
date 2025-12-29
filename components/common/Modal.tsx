
import React, { useEffect } from 'react';
import { ICONS } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative w-full max-w-6xl glass-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
             <span>{title}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
          >
            <ICONS.AlertCircle className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;


import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon, extra }) => {
  return (
    <div className={`glass-card rounded-xl flex flex-col overflow-hidden transition-all border border-white/5 bg-white/[0.02] ${className}`}>
      {(title || icon || extra) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0 bg-white/[0.03]">
          <div className="flex items-center space-x-2.5">
            {icon && (
              <div className="opacity-90">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
              </div>
            )}
            {title && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</h3>}
          </div>
          {extra && <div className="flex items-center">{extra}</div>}
        </div>
      )}
      <div className="flex-1 min-h-0 p-4 relative flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default Card;

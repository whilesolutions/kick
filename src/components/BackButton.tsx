import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Volver',
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 border border-neutral-800 transition-all cursor-pointer min-h-[44px] min-w-[44px] touch-manipulation ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
      <span>{label}</span>
    </button>
  );
};

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: 1 | 2;
  totalSteps?: number;
  stepName?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 2,
  stepName
}) => {
  return (
    <div className="w-full px-4 pt-2 pb-3">
      <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-2">
        <span className="flex items-center gap-1.5 text-neutral-200">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Paso {currentStep} de {totalSteps}
        </span>
        {stepName && (
          <span className="text-neutral-400 font-medium normal-case truncate max-w-[180px]">
            {stepName}
          </span>
        )}
      </div>

      {/* Visual step progress bar */}
      <div className="grid grid-cols-2 gap-2 h-1.5 w-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            currentStep >= 1 ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-neutral-800'
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            currentStep >= 2 ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-neutral-800'
          }`}
        />
      </div>
    </div>
  );
};

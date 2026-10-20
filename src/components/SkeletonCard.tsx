import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 flex flex-col justify-between animate-pulse">
      {/* Product Image placeholder */}
      <div className="w-full aspect-square rounded-xl bg-neutral-800/80 mb-3" />

      {/* Meta lines */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-neutral-800 rounded" />
        <div className="h-4 w-full bg-neutral-800 rounded" />
        <div className="h-4 w-3/4 bg-neutral-800 rounded" />
      </div>

      {/* Price & CTA placeholder */}
      <div className="mt-4 pt-2 border-t border-neutral-800/50 flex flex-col gap-2">
        <div className="h-5 w-20 bg-neutral-800 rounded" />
        <div className="h-11 w-full bg-neutral-800 rounded-xl" />
      </div>
    </div>
  );
};

'use client';

export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 animate-spin-slow">
          {/* Badminton racket SVG */}
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Racket head (oval) */}
            <ellipse cx="28" cy="24" rx="16" ry="18" stroke="#16a34a" strokeWidth="3" fill="#dcfce7" />
            {/* String lines horizontal */}
            <line x1="13" y1="18" x2="43" y2="18" stroke="#16a34a" strokeWidth="1" />
            <line x1="12" y1="24" x2="44" y2="24" stroke="#16a34a" strokeWidth="1" />
            <line x1="13" y1="30" x2="43" y2="30" stroke="#16a34a" strokeWidth="1" />
            {/* String lines vertical */}
            <line x1="20" y1="6" x2="20" y2="42" stroke="#16a34a" strokeWidth="1" />
            <line x1="28" y1="6" x2="28" y2="42" stroke="#16a34a" strokeWidth="1" />
            <line x1="36" y1="6" x2="36" y2="42" stroke="#16a34a" strokeWidth="1" />
            {/* Handle */}
            <rect x="25" y="40" width="6" height="18" rx="3" fill="#15803d" />
            {/* Grip wrap lines */}
            <line x1="25" y1="45" x2="31" y2="45" stroke="#bbf7d0" strokeWidth="1.5" />
            <line x1="25" y1="49" x2="31" y2="49" stroke="#bbf7d0" strokeWidth="1.5" />
            <line x1="25" y1="53" x2="31" y2="53" stroke="#bbf7d0" strokeWidth="1.5" />
          </svg>
        </div>
        {label && (
          <p className="text-sm font-medium text-gray-500 animate-pulse">{label}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-57px)] gap-4">
      <div className="w-16 h-16 animate-spin-slow">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <ellipse cx="28" cy="24" rx="16" ry="18" stroke="#16a34a" strokeWidth="3" fill="#dcfce7" />
          <line x1="13" y1="18" x2="43" y2="18" stroke="#16a34a" strokeWidth="1" />
          <line x1="12" y1="24" x2="44" y2="24" stroke="#16a34a" strokeWidth="1" />
          <line x1="13" y1="30" x2="43" y2="30" stroke="#16a34a" strokeWidth="1" />
          <line x1="20" y1="6" x2="20" y2="42" stroke="#16a34a" strokeWidth="1" />
          <line x1="28" y1="6" x2="28" y2="42" stroke="#16a34a" strokeWidth="1" />
          <line x1="36" y1="6" x2="36" y2="42" stroke="#16a34a" strokeWidth="1" />
          <rect x="25" y="40" width="6" height="18" rx="3" fill="#15803d" />
          <line x1="25" y1="45" x2="31" y2="45" stroke="#bbf7d0" strokeWidth="1.5" />
          <line x1="25" y1="49" x2="31" y2="49" stroke="#bbf7d0" strokeWidth="1.5" />
          <line x1="25" y1="53" x2="31" y2="53" stroke="#bbf7d0" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="text-sm text-gray-400 animate-pulse">กำลังโหลด...</p>
    </div>
  );
}

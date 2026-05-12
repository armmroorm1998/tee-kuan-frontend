'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg bg-white flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span className="text-gray-800">{selected?.label}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-4 text-lg flex items-center justify-between transition-colors ${
                o.value === value
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              {o.label}
              {o.value === value && <Check className="w-5 h-5 text-green-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

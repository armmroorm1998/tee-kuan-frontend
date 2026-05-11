'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getMe } from '@/lib/apiClient';
import type { Owner } from '@/types';

interface OwnerContextValue {
  owner: Owner | null;
  isLoading: boolean;
  isIdentified: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMe();
      setOwner(data);
    } catch {
      setOwner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => setOwner(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <OwnerContext.Provider
      value={{ owner, isLoading, isIdentified: !!owner, refresh, clear }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error('useOwner must be used inside OwnerProvider');
  return ctx;
}

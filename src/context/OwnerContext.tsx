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

const SESSION_FLAG = 'hasOwner';

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMe();
      localStorage.setItem(SESSION_FLAG, '1');
      setOwner(data);
    } catch {
      localStorage.removeItem(SESSION_FLAG);
      setOwner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(SESSION_FLAG);
    setOwner(null);
  }, []);

  useEffect(() => {
    // Only call /me if a previous session flag exists (client-only, after hydration)
    if (!localStorage.getItem(SESSION_FLAG)) {
      setIsLoading(false);
      return;
    }
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

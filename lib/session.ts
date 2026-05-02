import { router } from 'expo-router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  createElement,
} from 'react';
import { config } from './config';

type SessionCtx = {
  resetIdle: () => void;
  goHome: () => void;
};

const Ctx = createContext<SessionCtx | null>(null);

export function KioskSessionProvider({ children }: { children: ReactNode }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goHome = useCallback(() => {
    try {
      router.replace('/');
    } catch {
      // router not yet mounted; ignore
    }
  }, []);

  const resetIdle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goHome();
    }, config.idleTimeoutMs);
  }, [goHome]);

  useEffect(() => {
    resetIdle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetIdle]);

  const value = useMemo(() => ({ resetIdle, goHome }), [resetIdle, goHome]);
  return createElement(Ctx.Provider, { value }, children);
}

export function useKioskSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      resetIdle: () => {},
      goHome: () => {},
    };
  }
  return ctx;
}

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
  holdIdle: () => () => void;
};

const Ctx = createContext<SessionCtx | null>(null);

export function KioskSessionProvider({ children }: { children: ReactNode }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdsRef = useRef(0);

  const goHome = useCallback(() => {
    try {
      router.replace('/');
    } catch {
      // router not yet mounted; ignore
    }
  }, []);

  const resetIdle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (holdsRef.current > 0) return;
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

  // A screen with its own deadline (e.g. the payment QR) pauses the idle timer; returns the release.
  const holdIdle = useCallback(() => {
    holdsRef.current++;
    resetIdle();
    return () => {
      holdsRef.current--;
      resetIdle();
    };
  }, [resetIdle]);

  const value = useMemo(() => ({ resetIdle, goHome, holdIdle }), [resetIdle, goHome, holdIdle]);
  return createElement(Ctx.Provider, { value }, children);
}

export function useKioskSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      resetIdle: () => {},
      goHome: () => {},
      holdIdle: () => () => {},
    };
  }
  return ctx;
}

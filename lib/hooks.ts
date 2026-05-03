import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export function useOnce(fn: () => void | (() => void)): void {
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    return fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useAutoRedirectHome(active: boolean, seconds: number): number {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!active) {
      setRemaining(seconds);
      return;
    }
    const startedAt = Date.now();
    setRemaining(seconds);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const next = Math.max(0, seconds - elapsed);
      setRemaining((prev) => (prev === next ? prev : next));
      if (next <= 0) clearInterval(id);
    }, 250);
    const done = setTimeout(() => {
      router.replace('/');
    }, seconds * 1000);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, [active, seconds]);

  return remaining;
}

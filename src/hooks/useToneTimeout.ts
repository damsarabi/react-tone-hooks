import { useRef, useEffect, useCallback } from 'react';

export function useToneTimeout() {
  const timeoutIds = useRef<Set<NodeJS.Timeout>>(new Set());

  /**
   * Safe version of setTimeout that automatically clears on unmount.
   */
  const setSafeTimeout = useCallback((callback: () => void, ms?: number) => {
    const id = setTimeout(() => {
      timeoutIds.current.delete(id);
      callback();
    }, ms);
    timeoutIds.current.add(id);
    return id;
  }, []);

  /**
   * Manually clear a tracked timeout.
   */
  const clearSafeTimeout = useCallback((id: NodeJS.Timeout) => {
    clearTimeout(id);
    timeoutIds.current.delete(id);
  }, []);

  useEffect(() => {
    return () => {
      // Clear all active timeouts on unmount
      timeoutIds.current.forEach((id) => {
        clearTimeout(id);
      });
      timeoutIds.current.clear();
    };
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
}

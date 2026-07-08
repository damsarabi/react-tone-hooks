import { useRef, useEffect, useCallback } from 'react';

/**
 * A hook for managing asynchronous audio timeouts safely within React components.
 * 
 * When scheduling asynchronous audio events (e.g. envelope release tails), a standard 
 * `setTimeout` will still trigger its callback even if the React component unmounts. 
 * This can cause the callback to attempt to manipulate a Tone.js audio graph that 
 * has already been destroyed, crashing the app.
 * 
 * `useToneTimeout` provides a `setSafeTimeout` function that automatically clears 
 * any pending timeouts when the component unmounts.
 * 
 * @returns An object containing `setSafeTimeout` and `clearSafeTimeout`.
 * 
 * @example
 * ```tsx
 * import { useToneTimeout } from 'react-tone-hooks';
 *
 * export function EnvelopeComponent() {
 *   const { setSafeTimeout } = useToneTimeout();
 *
 *   const triggerRelease = () => {
 *     // This timeout is safe: if the user navigates away before 2 seconds,
 *     // the timeout is automatically cleared, preventing zombie callbacks.
 *     setSafeTimeout(() => {
 *       console.log("Release envelope finished");
 *     }, 2000);
 *   };
 *
 *   return <button onClick={triggerRelease}>Release Note</button>;
 * }
 * ```
 */
export function useToneTimeout() {
  const timeoutIds = useRef<Set<NodeJS.Timeout>>(new Set());

  /**
   * Safe version of `setTimeout` that automatically clears the timeout if the 
   * component unmounts before it executes.
   * 
   * @param callback The function to execute after the timer expires.
   * @param ms The time, in milliseconds, the timer should wait before execution.
   * @returns The timeout ID, which can be passed to `clearSafeTimeout`.
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
   * Manually clear a timeout previously tracked by `setSafeTimeout`.
   * 
   * @param id The timeout ID returned by `setSafeTimeout`.
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

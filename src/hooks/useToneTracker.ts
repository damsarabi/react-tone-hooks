import { useRef, useEffect, useCallback } from 'react';

/**
 * Interface representing a node that has a dispose method,
 * like most Tone.js audio nodes and components.
 */
interface Disposable {
  dispose?: () => void;
  [key: string]: any;
}

export function useToneTracker() {
  const trackedNodes = useRef<Disposable[]>([]);

  /**
   * Tracks a Tone.js node so it can be disposed of on unmount.
   */
  const trackNode = useCallback(<T extends Disposable>(node: T): T => {
    trackedNodes.current.push(node);
    return node;
  }, []);

  useEffect(() => {
    return () => {
      // Dispose all tracked nodes on unmount
      trackedNodes.current.forEach((node) => {
        if (node && typeof node.dispose === 'function') {
          try {
            node.dispose();
          } catch (e) {
            console.error('Failed to dispose Tone node:', e);
          }
        }
      });
      // Clear the tracking array
      trackedNodes.current = [];
    };
  }, []);

  return { trackNode };
}

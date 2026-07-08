import { useRef, useEffect, useCallback } from 'react';

/**
 * Interface representing a node that has a dispose method,
 * like most Tone.js audio nodes and components.
 */
interface Disposable {
  dispose?: () => void;
  [key: string]: any;
}

/**
 * A hook for managing the lifecycle of Tone.js audio nodes within React components.
 * 
 * In React, components may re-render frequently. Without proper garbage collection, 
 * Tone.js nodes (like Synths, Oscillators, and Filters) will remain active in memory, 
 * leading to polyphony stacking, digital clipping, and memory leaks. 
 * 
 * `useToneTracker` solves this by tracking initialized nodes and deterministically 
 * disposing of them when the component unmounts.
 *
 * @returns An object containing the `trackNode` function.
 * 
 * @example
 * ```tsx
 * import { useEffect } from 'react';
 * import * as Tone from 'tone';
 * import { useToneTracker } from 'react-tone-hooks';
 *
 * export function SynthComponent() {
 *   const { trackNode } = useToneTracker();
 *
 *   useEffect(() => {
 *     // The Synth and Filter will be automatically disposed when the component unmounts
 *     const synth = trackNode(new Tone.PolySynth().toDestination());
 *     const filter = trackNode(new Tone.Filter(400, 'lowpass').toDestination());
 *     
 *     synth.connect(filter);
 *   }, [trackNode]);
 *
 *   return <button onClick={() => Tone.start()}>Play</button>;
 * }
 * ```
 */
export function useToneTracker() {
  const trackedNodes = useRef<Disposable[]>([]);

  /**
   * Tracks a Tone.js node (or any object with a `.dispose()` method) so it can 
   * be automatically disposed of when the component unmounts.
   * 
   * @param node The node to track (e.g. `new Tone.Synth()`).
   * @returns The tracked node, allowing for inline tracking and assignment.
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

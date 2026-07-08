import { renderHook } from '@testing-library/react';
import { useToneTracker } from '../useToneTracker';
import { vi, describe, it, expect } from 'vitest';

describe('useToneTracker', () => {
  it('should call dispose on tracked nodes when unmounted', () => {
    const { result, unmount } = renderHook(() => useToneTracker());
    
    const mockNode = { dispose: vi.fn() };
    
    result.current.trackNode(mockNode);
    
    unmount();
    
    expect(mockNode.dispose).toHaveBeenCalledTimes(1);
  });

  it('should call dispose on multiple tracked nodes when unmounted', () => {
    const { result, unmount } = renderHook(() => useToneTracker());
    
    const mockNode1 = { dispose: vi.fn() };
    const mockNode2 = { dispose: vi.fn() };
    
    result.current.trackNode(mockNode1);
    result.current.trackNode(mockNode2);
    
    unmount();
    
    expect(mockNode1.dispose).toHaveBeenCalledTimes(1);
    expect(mockNode2.dispose).toHaveBeenCalledTimes(1);
  });

  it('should gracefully handle errors if a node throws during dispose', () => {
    const { result, unmount } = renderHook(() => useToneTracker());
    const errorSpy = vi.spyOn(global.console, 'error').mockImplementation(() => {});
    
    const badNode = {
      dispose: () => {
        throw new Error('Test dispose error');
      }
    };
    const goodNode = { dispose: vi.fn() };
    
    result.current.trackNode(badNode);
    result.current.trackNode(goodNode);
    
    // Should not throw, and should continue disposing other nodes
    expect(() => unmount()).not.toThrow();
    
    expect(errorSpy).toHaveBeenCalledWith('Failed to dispose Tone node:', expect.any(Error));
    expect(goodNode.dispose).toHaveBeenCalledTimes(1);
    
    errorSpy.mockRestore();
  });

  it('should ignore nodes that do not have a dispose method or are falsy', () => {
    const { result, unmount } = renderHook(() => useToneTracker());
    
    // @ts-expect-error - testing invalid inputs
    result.current.trackNode(null);
    // @ts-expect-error - testing invalid inputs
    result.current.trackNode(undefined);
    result.current.trackNode({ somethingElse: true } as any);
    
    // Should simply not crash
    expect(() => unmount()).not.toThrow();
  });
});

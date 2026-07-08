import { renderHook } from '@testing-library/react';
import { useToneTimeout } from '../useToneTimeout';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useToneTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute the callback after the elapsed time', () => {
    const { result } = renderHook(() => useToneTimeout());
    const callback = vi.fn();
    
    result.current.setSafeTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not execute the callback if unmounted before time elapses', () => {
    const { result, unmount } = renderHook(() => useToneTimeout());
    const callback = vi.fn();
    
    result.current.setSafeTimeout(callback, 1000);
    
    unmount();
    
    vi.advanceTimersByTime(1000);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should manually clear the timeout preventing callback execution', () => {
    const { result } = renderHook(() => useToneTimeout());
    const callback = vi.fn();
    
    const id = result.current.setSafeTimeout(callback, 1000);
    
    result.current.clearSafeTimeout(id);
    
    vi.advanceTimersByTime(1000);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear multiple timeouts when unmounted', () => {
    const { result, unmount } = renderHook(() => useToneTimeout());
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    result.current.setSafeTimeout(callback1, 1000);
    result.current.setSafeTimeout(callback2, 2000);
    
    unmount();
    
    vi.advanceTimersByTime(2000);
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should not fail if clearSafeTimeout is called on an already executed timeout', () => {
    const { result } = renderHook(() => useToneTimeout());
    const callback = vi.fn();
    
    const id = result.current.setSafeTimeout(callback, 1000);
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Clearing it after execution shouldn't do anything or throw
    expect(() => result.current.clearSafeTimeout(id)).not.toThrow();
  });
});

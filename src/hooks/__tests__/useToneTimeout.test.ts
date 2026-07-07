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
});

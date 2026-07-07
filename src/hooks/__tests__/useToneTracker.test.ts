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
});

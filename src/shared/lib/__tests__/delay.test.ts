import { describe, it, expect, vi } from 'vitest';
import { delay } from '../delay';

describe('delay', () => {
  it('returns a promise that resolves', async () => {
    vi.useFakeTimers();
    const p = delay(100, 100);
    vi.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('resolves within the specified range', async () => {
    const start = Date.now();
    await delay(10, 20);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(9); // small tolerance
    expect(elapsed).toBeLessThan(100);
  });

  it('uses default range when no arguments given', async () => {
    // Just verify it resolves without error
    await expect(delay()).resolves.toBeUndefined();
  });
});


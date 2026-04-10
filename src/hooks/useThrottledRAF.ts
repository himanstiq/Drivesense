import { useEffect, useRef } from 'react';

/**
 * A hook that runs a callback inside a `requestAnimationFrame` loop,
 * but only flushes accumulated results to React state at a throttled rate.
 *
 * @param tick       — Called every animation frame. Receives `dt` (ms since last frame).
 *                     Use this to update refs / mutable data at full 60fps.
 * @param flush      — Called at the throttled rate (default ~15fps).
 *                     Use this to copy ref data → React state, triggering re-renders.
 * @param deps       — Dependency array. The entire RAF loop restarts when these change.
 * @param flushEvery — Flush to state every N frames (default 4 → ~15fps at 60hz).
 */
export function useThrottledRAF(
  tick: (dt: number) => void,
  flush: () => void,
  deps: React.DependencyList,
  flushEvery = 4
) {
  // Keep the latest callbacks in refs so the RAF loop never goes stale
  const tickRef = useRef(tick);
  const flushRef = useRef(flush);
  tickRef.current = tick;
  flushRef.current = flush;

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      tickRef.current(dt);

      frameCount++;
      if (frameCount >= flushEvery) {
        frameCount = 0;
        flushRef.current();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

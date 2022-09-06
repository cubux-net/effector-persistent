import { Event, Store } from 'effector';

interface Options<T> {
  /**
   * Source unit to watch
   */
  source: Store<T> | Event<T>;
  /**
   * Receiver to flush data to
   */
  target: (payload: T) => void;
  /**
   * Debounce timeout to await before flush. Actual flush `target` will be
   * called only after `source` unit will stop triggering for at least this
   * duration. That is while `source` is keeping triggering continuous within
   * this duration, flush `target` will never be called.
   */
  flushDelay?: number;
}

/**
 * Setup delayed flushes from `source` unit to `target` with whe given debounce
 * interval. Default interval duration is `1000` (1 sec).
 * @return Function to stop watching and interrupt pending flush.
 */
export function flushDelayed<T>({
  source,
  target,
  flushDelay = 1000,
}: Options<T>) {
  let tId: ReturnType<typeof setTimeout>;

  const sub = source.watch((state: T) => {
    clearTimeout(tId);
    tId = setTimeout(() => target(state), flushDelay);
  });

  return () => {
    clearTimeout(tId);
    sub.unsubscribe();
  };
}

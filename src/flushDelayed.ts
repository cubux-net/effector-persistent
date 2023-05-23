import { Event, guard, Store } from 'effector';

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
   *
   * When `Store<number>` is used, it's value will take effect only on next
   * `source` update.
   */
  flushDelay?: number | Store<number>;
  /**
   * When specified, flushes will work only when this filter `Store` is `true`.
   * When its value becomes `false`, it will abort current planned flush.
   */
  filter?: Store<boolean>;
}

/**
 * Setup delayed flushes from `source` unit to `target` with whe given debounce
 * interval. Default interval duration is `1000` (1 sec).
 * @return Function to stop watching and interrupt planned flush.
 */
export function flushDelayed<T>({
  source,
  target,
  flushDelay = 1000,
  filter,
}: Options<T>) {
  let tId: ReturnType<typeof setTimeout>;

  const sub = source.watch((state: T) => {
    clearTimeout(tId);
    if (!filter || filter.getState()) {
      tId = setTimeout(
        () => target(state),
        typeof flushDelay === 'number' ? flushDelay : flushDelay.getState()
      );
    }
  });
  if (filter) {
    guard({
      source: filter.updates,
      filter: (b) => !b,
    }).watch(() => clearTimeout(tId));
  }

  return () => {
    clearTimeout(tId);
    sub.unsubscribe();
  };
}

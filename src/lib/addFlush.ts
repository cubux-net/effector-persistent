import { Event, Store } from 'effector';
import { flushDelayed } from '../flushDelayed';

export function addFlush<V>(
  source: Store<V> | Event<V>,
  flushDelay: number | undefined,
  flush: (value: V) => void
) {
  if (flushDelay === undefined) {
    source.watch(flush);
  } else {
    flushDelayed({
      source,
      flushDelay,
      target: flush,
    });
  }
}

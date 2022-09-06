import { Store } from 'effector';
import { flushDelayed } from '../flushDelayed';

export function addFlush<V>(
  store: Store<V>,
  flushDelay: number | undefined,
  flush: (value: V) => void
) {
  if (flushDelay === undefined) {
    store.watch(flush);
  } else {
    flushDelayed({
      source: store,
      flushDelay,
      target: flush,
    });
  }
}

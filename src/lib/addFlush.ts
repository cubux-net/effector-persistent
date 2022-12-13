import { Event } from 'effector';
import { flushDelayed } from '../flushDelayed';

export function addFlush<V>(
  source: Event<V>,
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

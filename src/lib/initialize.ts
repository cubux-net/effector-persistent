import { createEvent, Store } from 'effector';
import { addFlush } from './addFlush';
import { WithPersistentOptions } from '../types';

export function initialize<D, V>(
  driver: D | Promise<D>,
  store: Store<V>,
  { flushDelay }: WithPersistentOptions = {},
  read: (driver: D) => Promise<V | undefined>,
  write: (driver: D, value: V) => Promise<void>
) {
  function setup(driver: D) {
    read(driver).then(
      (s) => {
        if (s !== undefined) {
          const init = createEvent<V>();
          store.on(init, (_, s) => s);
          init(s);
        }
      },
      (e) => {
        console.error('Failed to read value from persistent driver', e);
      }
    );

    addFlush(store, flushDelay, (s) => {
      write(driver, s).catch((e) => {
        console.error('Failed to write data to persistent driver', e);
      });
    });
  }

  if (driver instanceof Promise) {
    driver.then(setup, (e) => {
      console.error('Failed to async initialize driver', e);
    });
  } else {
    setup(driver);
  }
}

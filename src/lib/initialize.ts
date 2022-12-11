import { createEvent, guard, is, Store } from 'effector';
import { addFlush } from './addFlush';
import { WithPersistentOptions } from '../types';

const noop = (v: any) => v;
const isStore = <S, U>(unit: Store<S> | U): unit is Store<S> => is.store(unit);

export function initialize<Driver, Value, Serialized = Value>(
  driver: Driver | Promise<Driver>,
  store: Store<Value>,
  {
    flushDelay,
    readOnly,
    serialize = noop,
    unserialize = noop,
    wakeUp = store,
  }: WithPersistentOptions<Value, Value, Serialized> = {},
  read: (driver: Driver) => Promise<Serialized | undefined>,
  write: (driver: Driver, value: Serialized) => Promise<void>
) {
  function setup(driver: Driver) {
    read(driver).then(
      (s) => {
        if (s !== undefined) {
          return Promise.resolve(unserialize(s)).then(
            isStore(wakeUp)
              ? (v) => {
                  const init = createEvent<Value>();
                  wakeUp.on(init, (_, v) => v);
                  init(v);
                }
              : wakeUp,
            (e) =>
              console.error(
                'Failed to unserialize output from persistent driver',
                e
              )
          );
        }
      },
      (e) => console.error('Failed to read value from persistent driver', e)
    );

    addFlush(
      readOnly ? guard({ source: store, filter: readOnly }) : store,
      flushDelay,
      (v) => {
        Promise.resolve(serialize(v)).then(
          (s) =>
            write(driver, s).catch((e) =>
              console.error('Failed to write data to persistent driver', e)
            ),
          (e) =>
            console.error(
              'Failed to serialize input before write to persistent driver',
              e
            )
        );
      }
    );
  }

  if (driver instanceof Promise) {
    driver.then(setup, (e) => {
      console.error('Failed to async initialize driver', e);
    });
  } else {
    setup(driver);
  }
}

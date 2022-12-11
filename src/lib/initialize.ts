import {
  combine,
  createEvent,
  createStore,
  Event,
  guard,
  is,
  Store,
} from 'effector';
import { addFlush } from './addFlush';
import { WithPersistentOptions } from '../types';

const noop = (v: any) => v;
const isStore = <S, U>(unit: Store<S> | U): unit is Store<S> => is.store(unit);

const safeFire = <V>(event: Event<V> | undefined, payload: V) => {
  if (event) {
    try {
      event(payload);
    } catch (e) {
      console.error('Unexpected error while firing event', event, e);
    }
  }
};

export function initialize<Driver, Value, Serialized = Value>(
  driver: Driver | Promise<Driver>,
  store: Store<Value>,
  {
    flushDelay,
    onFlushStart,
    onFlushDone,
    onFlushFail,
    onFlushFinally,
    readOnly,
    serialize = noop,
    unserialize = noop,
    wakeUp = store,
  }: WithPersistentOptions<Value, Value, Serialized> = {},
  read: (driver: Driver) => Promise<Serialized | undefined>,
  write: (driver: Driver, value: Serialized) => Promise<void>
) {
  function setup(driver: Driver) {
    const setWakingUp = createEvent<boolean>();
    const $isWritable = createStore(true).on(setWakingUp, (_, b) => !b);

    read(driver).then(
      (s) => {
        if (s !== undefined) {
          return Promise.resolve(unserialize(s)).then(
            (v) => {
              setWakingUp(true);
              try {
                if (isStore(wakeUp)) {
                  const init = createEvent<Value>();
                  wakeUp.on(init, (_, v) => v);
                  init(v);
                } else {
                  wakeUp(v);
                }
              } finally {
                setWakingUp(false);
              }
            },
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
      guard({
        source: store.updates,
        filter: readOnly
          ? combine($isWritable, readOnly, (w, ro) => w && !ro)
          : $isWritable,
      }),
      flushDelay,
      (v) => {
        const id = Symbol();
        safeFire(onFlushStart, { id });
        // TODO: returned promise should be used to queue parallel write attempts
        //   Now it does not matter because `localStorage` is not async,
        //   and `indexedDB` uses transactions with exclusive lock.
        Promise.resolve(serialize(v))
          .then(
            (s) =>
              write(driver, s).catch((e) => {
                console.error('Failed to write data to persistent driver', e);
                return Promise.reject(e);
              }),
            (e) => {
              console.error(
                'Failed to serialize input before write to persistent driver',
                e
              );
              return Promise.reject(e);
            }
          )
          .then(
            () => {
              safeFire(onFlushDone, { id });
            },
            (error) => {
              safeFire(onFlushFail, { id, error });
            }
          )
          .finally(() => {
            safeFire(onFlushFinally, { id });
          });
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

import {
  createEvent,
  createStore,
  Event,
  guard,
  is,
  merge,
  sample,
  Store,
} from 'effector';
import { WithPersistentOptions } from '../types';
import { addFlush } from './addFlush';
import { noopSerialize } from './noopSerialize';

const isStore = <S, U>(unit: Store<S> | U): unit is Store<S> => is.store(unit);

function initWakeUp<Driver, Value, Serialized>(
  driver: Driver,
  unserialize: (output: Serialized) => Promise<Value> | Value,
  wakeUp: Store<Value> | ((state: Value) => void),
  read: (driver: Driver) => Promise<Serialized | undefined>
) {
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
  return $isWritable;
}

const safeFire = <V>(event: Event<V> | undefined, payload: V) => {
  if (event) {
    try {
      event(payload);
    } catch (e) {
      console.error('Unexpected error while firing event', event, e);
    }
  }
};

function initFlush<Value>(
  store: Store<Value>,
  readOnly: Store<boolean> | undefined,
  isWritable: Store<boolean>
) {
  const setPrev = createEvent<Value>();
  const $prev = createStore(store.defaultState).on(setPrev, (_, p) => p);

  const didUpdate = readOnly
    ? guard({
        source: store.updates,
        filter: readOnly.map((ro) => !ro),
      })
    : store.updates;

  const toWrite = guard({
    source: sample({
      clock: didUpdate,
      source: $prev,
      fn: (prev, next) => ({ next, prev }),
    }),
    filter: isWritable,
  });

  (readOnly
    ? merge([
        didUpdate,
        sample({
          clock: guard({
            source: readOnly,
            filter: (ro) => !ro,
          }),
          source: store,
        }),
      ])
    : didUpdate
  ).watch(setPrev);

  return toWrite;
}

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
    unserialize = noopSerialize,
    wakeUp = store,
  }: Omit<WithPersistentOptions<Value, Value, Serialized>, 'serialize'>,
  read: (driver: Driver) => Promise<Serialized | undefined>,
  write: (driver: Driver, value: Value, prev: Value) => Promise<void>
) {
  function setup(driver: Driver) {
    addFlush(
      initFlush(store, readOnly, initWakeUp(driver, unserialize, wakeUp, read)),
      flushDelay,
      ({ next, prev }) => {
        const id = Symbol();
        safeFire(onFlushStart, { id });
        // TODO: returned promise should be used to queue parallel write attempts
        //   Now it does not matter because `localStorage` is not async,
        //   and `indexedDB` uses transactions with exclusive lock.
        write(driver, next, prev)
          .then(
            () => {
              safeFire(onFlushDone, { id });
            },
            (error) => {
              console.error('Failed to write data to persistent driver', error);
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

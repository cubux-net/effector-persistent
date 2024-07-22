import {
  createEvent,
  createStore,
  EventCallable,
  is,
  merge,
  sample,
  Store,
  StoreWritable,
} from 'effector';
import { WithPersistentOptions } from '../types';
import { addFlush } from './addFlush';
import { noopSerialize } from './noopSerialize';

const isStore = is.store;

function initWakeUp<Driver, Value, Serialized>({
  driver,
  read,
  unserialize,
  wakeUp,
  onBeforeWakeUp,
  onAfterWakeUp,
}: {
  driver: Driver;
  read: (driver: Driver) => Promise<Serialized | undefined>;
  unserialize: (output: Serialized) => Promise<Value> | Value;
  wakeUp: StoreWritable<Value> | ((state: Value) => void);
  onBeforeWakeUp?: () => void;
  onAfterWakeUp?: () => void;
}) {
  const setWakingUp = createEvent<boolean>();
  const $isWritable = createStore(true).on(setWakingUp, (_, b) => !b);

  read(driver).then(
    (s) => {
      if (s === undefined) {
        onBeforeWakeUp?.();
        onAfterWakeUp?.();
        return;
      }
      return Promise.resolve(unserialize(s)).then(
        (v) => {
          onBeforeWakeUp?.();
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
            onAfterWakeUp?.();
          }
        },
        (e) =>
          console.error(
            'Failed to unserialize output from persistent driver',
            e
          )
      );
    },
    (e) => console.error('Failed to read value from persistent driver', e)
  );
  return $isWritable;
}

const safeFire = <V>(event: EventCallable<V> | undefined, payload: V) => {
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
    ? sample({
        source: store.updates,
        filter: readOnly.map((ro) => !ro),
      })
    : store.updates;

  const toWrite = sample({
    clock: didUpdate,
    source: $prev,
    fn: (prev, next) => ({ next, prev }),
    filter: isWritable,
  });

  (readOnly
    ? merge([
        didUpdate,
        sample({
          clock: sample({
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
  store: StoreWritable<Value>,
  {
    flushDelay,
    onFlushStart,
    onFlushDone,
    onFlushFail,
    onFlushFinally,
    readOnly,
    unserialize = noopSerialize,
    wakeUp = store,
    onBeforeWakeUp,
    onAfterWakeUp,
  }: Omit<WithPersistentOptions<Value, Value, Serialized>, 'serialize'>,
  read: (driver: Driver) => Promise<Serialized | undefined>,
  write: (driver: Driver, value: Value, prev: Value) => Promise<void>
) {
  function setup(driver: Driver) {
    addFlush(
      initFlush(
        store,
        readOnly,
        initWakeUp({
          driver,
          read,
          unserialize,
          wakeUp,
          onBeforeWakeUp,
          onAfterWakeUp,
        })
      ),
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

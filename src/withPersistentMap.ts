import { NoInfer, Store, StoreWritable } from 'effector';
import { StoreDriver } from '@cubux/storage-driver';
import {
  CommonOptions,
  WithoutSerialization,
  WithoutWakeUp,
  WithSerialization,
  WithWakeUp,
} from './internal';
import { initialize } from './lib/initialize';
import { noopSerialize } from './lib/noopSerialize';

const containsNoPromises = <T>(
  array: readonly (T | Promise<T>)[]
): array is readonly T[] => !array.some((item) => item instanceof Promise);

const buildMapMapper = <V, U>(mapper?: (value: V) => U | Promise<U>) =>
  mapper &&
  (<K>(
    map: ReadonlyMap<K, V>
  ): ReadonlyMap<K, U> | Promise<ReadonlyMap<K, U>> => {
    const items = Array.from(map).map(([k, s]) => {
      const u = mapper(s);
      return u instanceof Promise
        ? Promise.resolve(u).then((u) => [k, u] as const)
        : ([k, u] as const);
    });
    return containsNoPromises(items)
      ? new Map(items)
      : Promise.all(items).then((items) => new Map(items));
  });

type DriverArg<K, V> =
  | StoreDriver<NoInfer<K>, NoInfer<V>>
  | Promise<StoreDriver<NoInfer<K>, NoInfer<V>>>;

// writable | wakeUp | serialize
//          | wakeUp | serialize
// writable | wakeUp |
//          | wakeUp |
// writable |        | serialize
// writable |        |

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param options Other options
 * @return Input store
 */
interface WithPersistentMapFn {
  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: StoreWritable<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Serialized>,
    options: CommonOptions<ReadonlyMap<Key, Value>, Value, Serialized> &
      WithSerialization<Value, Serialized> &
      WithWakeUp<ReadonlyMap<Key, Value>>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: Store<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Serialized>,
    options: CommonOptions<ReadonlyMap<Key, Value>, Value, Serialized> &
      WithSerialization<Value, Serialized> &
      WithWakeUp<ReadonlyMap<Key, Value>>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value>(
    store: StoreWritable<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Value>,
    options: CommonOptions<ReadonlyMap<Key, Value>, Value, Value> &
      WithoutSerialization<Value> &
      WithWakeUp<ReadonlyMap<Key, Value>>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value>(
    store: Store<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Value>,
    options: CommonOptions<ReadonlyMap<Key, Value>, Value, Value> &
      WithoutSerialization<Value> &
      WithWakeUp<ReadonlyMap<Key, Value>>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: StoreWritable<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Serialized>,
    options: CommonOptions<ReadonlyMap<Key, Value>, Value, Serialized> &
      WithSerialization<Value, Serialized> &
      WithoutWakeUp
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param options Other options
   * @return Input store
   */
  <Key, Value>(
    store: StoreWritable<ReadonlyMap<Key, Value>>,
    driver: DriverArg<Key, Value>,
    options?: CommonOptions<ReadonlyMap<Key, Value>, Value, Value> &
      WithoutSerialization<Value> &
      WithoutWakeUp
  ): typeof store;
}

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param options Other options
 * @return Input store
 */
function withPersistentMapFn<Key, Value, Serialized = Value>(
  store: StoreWritable<ReadonlyMap<Key, Value>>,
  driver: DriverArg<Key, Serialized>,
  options: CommonOptions<ReadonlyMap<Key, Value>, Value, Serialized> &
    Partial<WithSerialization<Value, Serialized>> &
    Partial<WithWakeUp<ReadonlyMap<Key, Value>>> = {}
): typeof store {
  const { serialize = noopSerialize, unserialize } = options;
  initialize<
    StoreDriver<Key, Serialized>,
    ReadonlyMap<Key, Value>,
    ReadonlyMap<Key, Serialized>
  >(
    driver,
    store,
    {
      ...options,
      unserialize: buildMapMapper(unserialize),
    },
    (driver) => driver.getAll(),
    (driver, value, prev) =>
      Promise.all([
        ...Array.from(value)
          .filter(([k, v]) => v !== prev.get(k))
          .map(([k, v]) =>
            Promise.resolve(serialize(v)).then((s) => driver.setItem(k, s))
          ),
        ...Array.from(prev)
          .filter(([k]) => !value.has(k))
          .map(([k]) => driver.removeItem(k)),
      ]).then(() => {})
  );

  return store;
}

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param options Other options
 * @return Input store
 */
export const withPersistentMap = withPersistentMapFn as WithPersistentMapFn;

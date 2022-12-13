import { Store } from 'effector';
import { StoreDriver } from '@cubux/storage-driver';
import { initialize } from './lib/initialize';
import { noopSerialize } from './lib/noopSerialize';
import { WithPersistentOptions } from './types';

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
  <Key, Value, Serialized>(
    store: Store<ReadonlyMap<Key, Value>>,
    driver:
      | StoreDriver<Key, Serialized>
      | Promise<StoreDriver<Key, Serialized>>,
    options: WithPersistentOptions<ReadonlyMap<Key, Value>, Value, Serialized>
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
    driver: StoreDriver<Key, Value> | Promise<StoreDriver<Key, Value>>,
    options?: WithPersistentOptions<ReadonlyMap<Key, Value>, Value, Value>
  ): typeof store;
}

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param options Other options
 * @return Input store
 */
export const withPersistentMap: WithPersistentMapFn = <
  Key,
  Value,
  Serialized = Value
>(
  store: Store<ReadonlyMap<Key, Value>>,
  driver: StoreDriver<Key, Serialized> | Promise<StoreDriver<Key, Serialized>>,
  options: WithPersistentOptions<
    ReadonlyMap<Key, Value>,
    Value,
    Serialized
  > = {}
): typeof store => {
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
};

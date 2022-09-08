import { Store } from 'effector';
import { StoreDriverMapped } from '@cubux/storage-driver';
import { initialize } from './lib/initialize';
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
export function withPersistentMap<
  Key,
  Value,
  TStore extends Store<ReadonlyMap<Key, Value>> = Store<
    ReadonlyMap<Key, Value>
  >,
  Serialized = Value
>(
  store: TStore,
  driver:
    | StoreDriverMapped<Key, Serialized>
    | Promise<StoreDriverMapped<Key, Serialized>>,
  options?: WithPersistentOptions<Value, Serialized>
): TStore {
  const { serialize, unserialize } = options || {};
  initialize<
    StoreDriverMapped<Key, Serialized>,
    ReadonlyMap<Key, Value>,
    ReadonlyMap<Key, Serialized>
  >(
    driver,
    store,
    options && {
      ...options,
      serialize: buildMapMapper(serialize),
      unserialize: buildMapMapper(unserialize),
    },
    (driver) => driver.getAll(),
    (driver, value) => driver.setAll(value)
  );

  return store;
}

import { StoreWritable } from 'effector';
import { StoreDriverSingle } from '@cubux/storage-driver';
import { initialize } from './lib/initialize';
import { WithPersistentOptions } from './types';

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param key Key for item in driver storage
 * @param options Other options
 * @return Input store
 */
export function withPersistent<Key, Value, Serialized = Value>(
  store: StoreWritable<Value>,
  driver:
    | StoreDriverSingle<Key, Serialized>
    | Promise<StoreDriverSingle<Key, Serialized>>,
  key: Key,
  options: WithPersistentOptions<Value, Value, Serialized> = {}
): typeof store {
  const { serialize } = options;
  initialize(
    driver,
    store,
    options,
    (driver) => driver.getItem(key),
    serialize
      ? (driver, value) =>
          Promise.resolve(serialize(value)).then((s) => driver.setItem(key, s))
      : (driver, value) => driver.setItem(key, value as any as Serialized)
  );

  return store;
}

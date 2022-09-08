import { Store } from 'effector';
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
export function withPersistent<
  Key,
  Value,
  TStore extends Store<Value> = Store<Value>,
  Serialized = Value
>(
  store: TStore,
  driver:
    | StoreDriverSingle<Key, Serialized>
    | Promise<StoreDriverSingle<Key, Serialized>>,
  key: Key,
  options?: WithPersistentOptions<Value, Serialized>
): TStore {
  initialize(
    driver,
    store,
    options,
    (driver) => driver.getItem(key),
    (driver, value) => driver.setItem(key, value)
  );

  return store;
}

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
export function withPersistent<K, V, S extends Store<V> = Store<V>>(
  store: S,
  driver: StoreDriverSingle<K, V> | Promise<StoreDriverSingle<K, V>>,
  key: K,
  options?: WithPersistentOptions
): S {
  initialize(
    driver,
    store,
    options,
    (driver) => driver.getItem(key),
    (driver, value) => driver.setItem(key, value)
  );

  return store;
}

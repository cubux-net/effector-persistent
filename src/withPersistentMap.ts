import { Store } from 'effector';
import { StoreDriverMapped } from '@cubux/storage-driver';
import { initialize } from './lib/initialize';
import { WithPersistentOptions } from './types';

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param options Other options
 * @return Input store
 */
export function withPersistentMap<
  K,
  V,
  S extends Store<ReadonlyMap<K, V>> = Store<ReadonlyMap<K, V>>
>(
  store: S,
  driver: StoreDriverMapped<K, V> | Promise<StoreDriverMapped<K, V>>,
  options?: WithPersistentOptions
): S {
  initialize(
    driver,
    store,
    options,
    (driver) => driver.getAll(),
    (driver, value) => driver.setAll(value)
  );

  return store;
}

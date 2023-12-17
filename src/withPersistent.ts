import { Store, StoreWritable } from 'effector';
import { StoreDriverSingle } from '@cubux/storage-driver';
import { OptionsWithoutWakeUp, OptionsWithWakeUp } from './internal';
import { initialize } from './lib/initialize';
import { WithPersistentOptions } from './types';

interface WithPersistentFn {
  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param key Key for item in driver storage
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: StoreWritable<Value>,
    driver:
      | StoreDriverSingle<Key, Serialized>
      | Promise<StoreDriverSingle<Key, Serialized>>,
    key: Key,
    options: OptionsWithWakeUp<Value, Value, Serialized>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param key Key for item in driver storage
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: Store<Value>,
    driver:
      | StoreDriverSingle<Key, Serialized>
      | Promise<StoreDriverSingle<Key, Serialized>>,
    key: Key,
    options: OptionsWithWakeUp<Value, Value, Serialized>
  ): typeof store;

  /**
   * Register persistent data handling for the given store with the given driver.
   * @param store Store to work with
   * @param driver Persistent storage driver
   * @param key Key for item in driver storage
   * @param options Other options
   * @return Input store
   */
  <Key, Value, Serialized = Value>(
    store: StoreWritable<Value>,
    driver:
      | StoreDriverSingle<Key, Serialized>
      | Promise<StoreDriverSingle<Key, Serialized>>,
    key: Key,
    options?: OptionsWithoutWakeUp<Value, Value, Serialized>
  ): typeof store;
}

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param key Key for item in driver storage
 * @param options Other options
 * @return Input store
 */
function withPersistentFn<Key, Value, Serialized = Value>(
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

/**
 * Register persistent data handling for the given store with the given driver.
 * @param store Store to work with
 * @param driver Persistent storage driver
 * @param key Key for item in driver storage
 * @param options Other options
 * @return Input store
 */
export const withPersistent = withPersistentFn as WithPersistentFn;

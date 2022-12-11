import { Store } from 'effector';

export interface WithPersistentOptions<
  State = any,
  Value = State,
  Serialized = Value
> {
  /**
   * Debounce subsequent store updates and flush only after latest change.
   * If set to `undefined` (default), no debounce will be used, so every store
   * update will be flushed to driver.
   */
  flushDelay?: number;
  /**
   * Optional flag store to disable writes to storage.
   */
  readOnly?: Store<boolean>;
  /**
   * Alternative target which will receive initial state read from driver on
   * initialization.
   */
  wakeUp?: Store<State> | ((state: State) => void);
  /**
   * Serialization before writing data to driver.
   */
  serialize?: (input: Value) => Serialized | Promise<Serialized>;
  /**
   * Unserialization after reading data from driver.
   */
  unserialize?: (output: Serialized) => Value | Promise<Value>;
}

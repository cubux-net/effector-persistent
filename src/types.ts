export interface WithPersistentOptions<Value = any, Serialized = Value> {
  /**
   * Debounce subsequent store updates and flush only after latest change.
   * If set to `undefined` (default), no debounce will be used, so every store
   * update will be flushed to driver.
   */
  flushDelay?: number;
  /**
   * Serialization before writing data to driver.
   */
  serialize?: (input: Value) => Serialized | Promise<Serialized>;
  /**
   * Unserialization after reading data from driver.
   */
  unserialize?: (output: Serialized) => Value | Promise<Value>;
}

export interface WithPersistentOptions {
  /**
   * Debounce subsequent store updates and flush only after latest change.
   * If set to `undefined` (default), no debounce will be used, so every store
   * update will be flushed to driver.
   */
  flushDelay?: number;
}

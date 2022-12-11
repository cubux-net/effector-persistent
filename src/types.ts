import { Event, Store } from 'effector';

export interface WithPersistentFlushEvent {
  /** Identifier for current flush flow */
  readonly id: symbol;
}
export interface WithPersistentFlushFailEvent extends WithPersistentFlushEvent {
  /** Reason of the failure */
  readonly error: unknown;
}

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
   * An Event to trigger before flushing to driver. An `id` in payload can be
   * used in all the rest "flush" events to identify the flow when it's needed.
   */
  onFlushStart?: Event<WithPersistentFlushEvent>;
  /**
   * An Event to trigger when flush succeeds. An `id` in payload refers to `id`
   * from appropriate `onFlushStart` payload.
   */
  onFlushDone?: Event<WithPersistentFlushEvent>;
  /**
   * An Event to trigger when flush fails. An `id` in payload refers to `id`
   * from appropriate `onFlushStart` payload.
   */
  onFlushFail?: Event<WithPersistentFlushFailEvent>;
  /**
   * An Event to trigger before flushing to driver. This al always triggering
   * after either `onFlushDone` or `onFlushFail`. An `id` in payload refers to
   * `id` from appropriate `onFlushStart` payload.
   */
  onFlushFinally?: Event<WithPersistentFlushEvent>;
  /**
   * A `filter` Store to disable writes to Driver.
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

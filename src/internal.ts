import { EventCallable, Store, StoreWritable } from 'effector';
import {
  WithPersistentFlushEvent,
  WithPersistentFlushFailEvent,
} from './types';

export interface WithWakeUp<State> {
  /**
   * Alternative target which will receive initial state read from driver on
   * initialization.
   */
  wakeUp: StoreWritable<State> | ((state: State) => void);
}
export interface WithoutWakeUp {
  wakeUp?: undefined;
}

export interface WithSerialization<Value, Serialized> {
  /**
   * Serialization before writing data to driver.
   */
  serialize: (input: Value) => Serialized | Promise<Serialized>;
  /**
   * Unserialization after reading data from driver.
   */
  unserialize: (output: Serialized) => Value | Promise<Value>;
}
export interface WithoutSerialization<Value>
  extends Partial<WithSerialization<Value, Value>> {}

export interface CommonOptions<State = any, Value = State, Serialized = Value> {
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
  onFlushStart?: EventCallable<WithPersistentFlushEvent>;
  /**
   * An Event to trigger when flush succeeds. An `id` in payload refers to `id`
   * from appropriate `onFlushStart` payload.
   */
  onFlushDone?: EventCallable<WithPersistentFlushEvent>;
  /**
   * An Event to trigger when flush fails. An `id` in payload refers to `id`
   * from appropriate `onFlushStart` payload.
   */
  onFlushFail?: EventCallable<WithPersistentFlushFailEvent>;
  /**
   * An Event to trigger before flushing to driver. This al always triggering
   * after either `onFlushDone` or `onFlushFail`. An `id` in payload refers to
   * `id` from appropriate `onFlushStart` payload.
   */
  onFlushFinally?: EventCallable<WithPersistentFlushEvent>;
  /**
   * A `filter` Store to disable writes to Driver.
   */
  readOnly?: Store<boolean>;
}

export interface OptionsWithWakeUp<
  State = any,
  Value = State,
  Serialized = Value
> extends CommonOptions<State, Value, Serialized>,
    Partial<WithSerialization<Value, Serialized>>,
    WithWakeUp<State> {}

export interface OptionsWithoutWakeUp<
  State = any,
  Value = State,
  Serialized = Value
> extends CommonOptions<State, Value, Serialized>,
    Partial<WithSerialization<Value, Serialized>>,
    WithoutWakeUp {}

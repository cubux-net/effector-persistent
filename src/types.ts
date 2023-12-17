import { CommonOptions, WithSerialization, WithWakeUp } from './internal';

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
> extends CommonOptions<State, Value, Serialized>,
    Partial<WithSerialization<Value, Serialized>>,
    Partial<WithWakeUp<State>> {}

/**
 * Internal no-op serializer when `U` is `T`
 * @param v
 */
export const noopSerialize = <T, U>(v: T) => v as any as U;

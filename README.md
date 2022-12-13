# `@cubux/effector-persistent`

[![NPM latest](https://img.shields.io/npm/v/@cubux/effector-persistent.svg)](https://www.npmjs.com/package/@cubux/effector-persistent)

Persist data in effector store.

```ts
import { createStore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { createLocalStorageDriver } from "@cubux/storage-driver";

const $accessToken = withPersistent(
  createStore(""),
  createLocalStorageDriver(),
  "accessToken"
);
```

## Install

```sh
npm i @cubux/effector-persistent
```

## API

See also [`@cubux/storage-driver`](https://github.com/cubux-net/ts-storage-driver).

### `withPersistent()`

Register persistent data handling for the given store with the given driver.
Data from `store` will be stored in `driver` with the given `key`. Function
returns input `store`, so it can be used inline.

```ts
function withPersistent<Key, Value, Serialized = Value>(
  store:    Store<Value>,
  driver:   StoreDriverSingle<Key, Serialized>
          | Promise<StoreDriverSingle<Key, Serialized>>,
  key:      Key,
  options?: WithPersistentOptions<Value, Value, Serialized>
): typeof store
```

Example:

```ts
import { createStore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { createLocalStorageDriver } from "@cubux/storage-driver";

const lsDriver = createLocalStorageDriver();
const $storeA = withPersistent(createStore(0), lsDriver, "keyA");
const $storeB = withPersistent(createStore(""), lsDriver, "keyB");
```

In the example above `$storeA` and `$storeB` will use `localStorage` for
persistent data with keys `"persistent:keyA"` and `"persistent:keyB"`
respectively.

### `withPersistentMap()`

Register persistent data handling for the given `ReadonlyMap` store with the
given driver. Data from `store` will be stored in `driver` with corresponding
keys from `ReadonlyMap`. Function returns input `store`, so it can be used
inline.

```ts
function withPersistentMap<Key, Value, Serialized = Value>(
  store:    Store<ReadonlyMap<Key, Value>>,
  driver:   StoreDriver<Key, Serialized>
          | Promise<StoreDriver<Key, Serialized>>,
  options?: WithPersistentOptions<ReadonlyMap<Key, Value>, Value, Serialized>
): typeof store
```

Under the hood on every `store` change it will detect changes in underlying
`Map` entries and will send to `driver` only those was changed.

**Notice:** Serialization when used with `options` will be applied to individual
values `Value` rather than to whole `Map<Key, Value>`.

Example:

```ts
import { createStore } from "effector";
import { withPersistentMap } from "@cubux/effector-persistent";
import { createLocalStorageDriver } from "@cubux/storage-driver";

const $storeMap = withPersistentMap(
  createStore<ReadonlyMap<string, number>>(new Map()),
  createLocalStorageDriver()
);
```

In the example above `$storeMap` will use `localStorage` for persistent data
with keys starting with `"persistent:"`, so every entry from `ReadonlyMap` will
have its own row in `localStorage`.

### `interface WithPersistentFlushEvent`

A payload for flush events.

| Property | Type     | Description                       |
|----------|----------|-----------------------------------|
| `id`     | `symbol` | Identifier for current flush flow |

### `interface WithPersistentFlushFailEvent`

A payload for flush events.

This interface extends `WithPersistentFlushEvent` with the following additional
properties:

| Property | Type      | Description           |
|----------|-----------|-----------------------|
| `error`  | `unknown` | Reason of the failure |

### `interface WithPersistentOptions`

Common options for persistent storage.

```ts
interface WithPersistentOptions<
  State = any,
  Value = State,
  Serialized = Value
>
```

| Options          | Type                                                                          | Default     | Description                                                                                                                                                                                      |
|------------------|-------------------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `flushDelay`     | `number`                                                                      | `undefined` | Debounce subsequent store updates and flush only after latest change. If set to `undefined` (default), no debounce will be used, so every store update will be flushed to driver.                |
| `onFlushStart`   | `Event<WithPersistentFlushEvent>`                                             | `undefined` | An Event to trigger before flushing to driver. An `id` in payload can be used in all the rest "flush" events to identify the flow when it's needed.                                              |
| `onFlushDone`    | `Event<WithPersistentFlushEvent>`                                             | `undefined` | An Event to trigger when flush succeeds. An `id` in payload refers to `id` from appropriate `onFlushStart` payload.                                                                              |
| `onFlushFail`    | `Event<WithPersistentFlushFailEvent>`                                         | `undefined` | An Event to trigger when flush fails. An `id` in payload refers to `id` from appropriate `onFlushStart` payload.                                                                                 |
| `onFlushFinally` | `Event<WithPersistentFlushEvent>`                                             | `undefined` | An Event to trigger before flushing to driver. This al always triggering after either `onFlushDone` or `onFlushFail`. An `id` in payload refers to `id` from appropriate `onFlushStart` payload. |
| `readOnly`       | `Store<boolean>`                                                              | `undefined` | A `filter` Store to disable writes to Driver.                                                                                                                                                    |
| `wakeUp`         | <code>Store&lt;State&gt; &#124; ((state: State) =&gt; void)</code>            | `undefined` | Alternative target which will receive initial state read from driver on initialization. When `undefined`, the source Store will be used.                                                         |
| `serialize`      | <code>(input: Value) =&gt; Serialized &#124; Promise&lt;Serialized&gt;</code> | `undefined` | Serialization before writing data to driver.                                                                                                                                                     |
| `unserialize`    | <code>(output: Serialized) =&gt; Value &#124; Promise&lt;Value&gt;</code>     | `undefined` | Unserialization after reading data from driver.                                                                                                                                                  |

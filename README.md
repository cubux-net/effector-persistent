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
function withPersistent<
  Key,
  Value,
  TStore extends Store<Value> = Store<Value>,
  Serialized = Value
>(
  store:    TStore,
  driver:   StoreDriverSingle<Key, Serialized>
          | Promise<StoreDriverSingle<Key, Serialized>>,
  key:      Key,
  options?: WithPersistentOptions<Value, Serialized>
): TStore
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
function withPersistentMap<
  Key,
  Value,
  TStore extends Store<ReadonlyMap<Key, Value>>
    = Store<ReadonlyMap<Key, Value>>,
  Serialized = Value
>(
  store:    TStore,
  driver:   StoreDriverMapped<Key, Serialized>
          | Promise<StoreDriverMapped<Key, Serialized>>,
  options?: WithPersistentOptions<Value, Serialized>
): TStore
```

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

### `interface WithPersistentOptions`

Common options for persistent storage.

```ts
interface WithPersistentOptions<
  Value = any,
  Serialized = Value
>
```

| Options       | Type                                                                          | Default     | Description                                                                                                                                                                       |
|---------------|-------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `flushDelay`  | <code>number &#124; undefined</code>                                          | `undefined` | Debounce subsequent store updates and flush only after latest change. If set to `undefined` (default), no debounce will be used, so every store update will be flushed to driver. |
| `serialize`   | <code>(input: Value) =&gt; Serialized &#124; Promise&lt;Serialized&gt;</code> | `undefined` | Serialization before writing data to driver.                                                                                                                                      |
| `unserialize` | <code>(output: Serialized) =&gt; Value &#124; Promise&lt;Value&gt;</code>     | `undefined` | Unserialization after reading data from driver.                                                                                                                                   |

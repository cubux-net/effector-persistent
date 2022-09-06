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
function withPersistent<K, V, S extends Store<V>>(
  store:    S,
  driver:   StoreDriverSingle<K, V> | Promise<StoreDriverSingle<K, V>>,
  key:      K,
  options?: WithPersistentOptions
): S
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
function withPersistentMap<K, V, S extends Store<ReadonlyMap<K, V>>>(
  store:    S,
  driver:   StoreDriverMapped<K, V> | Promise<StoreDriverMapped<K, V>>,
  options?: WithPersistentOptions
): S
```

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

| Options      | Type                                 | Default     | Description                                                                                                                                                                       |
|--------------|--------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `flushDelay` | <code>number &#124; undefined</code> | `undefined` | Debounce subsequent store updates and flush only after latest change. If set to `undefined` (default), no debounce will be used, so every store update will be flushed to driver. |

# Changelog

## 0.8.0 (2024-07-22)

- Add: `onBeforeWakeUp` and `onAfterWakeUp` callback options.

## 0.7.0 (2023-12-17)

- Fix: Both `withPersistent()` and `withPersistentMap()`, when `wakeUp` options
  is defined, not allow a `Store` rather then `StoreWritable`.

## 0.6.0 (2023-12-11)

- **BREAKING**: Drop Node < 18.
- **BREAKING**: Require `effector@^23`. Using `^23` range rather than `>=` as
  before. Upgrade to new Effector API, dropping previous versions. This cause
  the following changes:
  - `WithPersistentFlushEvent`
    - `onFlushStart`, `onFlushDone`, `onFlushFail` and `onFlushFinally` was
      changed from `Event` to `EventCallable`.
    - `wakeUp`: A `Store` case was changed to `StoreWritable`.
  - Both `withPersistent()` and `withPersistentMap()` changed their 1st argument
    from `Store` to `StoreWritable`.
- **BREAKING**: Require `@cubux/storage-driver@^0.4`
- Add: Allow TypeScript 5 in `peerDependencies`.

## 0.5.0 (2023-05-23)

- Add: `flushDelayed()` options:
  - `flushDelay` now can be `Store<number>`;
  - `filter` - optional `Store<boolean>` to conditionally disable flushes.
- Doc: `flushDelayed()` was not documented in README.

## 0.4.0 (2022-12-13)

- **BREAKING**: `withPersistentMap()` now requires the given Driver to be
  `StoreDriver` rather then `StoreDriverMapped` as before. This is how it should
  to work, but it wasn't before.
- Fix: `withPersistentMap()` now tracks changed elements in underlying `Map` and
  writes to Driver only what was changed. Before this a whole `Map` was sent to
  overwrite on every update.

## 0.3.0 (2022-12-12)

- **BREAKING**: Bump `effector` in `peerDependencies` to `~20.4.0 || >=21` for
  `guard()`.
- May be **BREAKING**: Prevent unnecessary writing to Driver when it's triggered
  on "wake up" phase.
- Add: Option `readOnly` of type `Store<boolean>` to disable writes to storage.
- Add: Options `onFlushStart`, `onFlushDone`, `onFlushFail` and `onFlushFinally`
  to track flushes into Driver.

## 0.2.0 (2022-09-10)

- **BREAKING**: Remove generic type parameter 3 in `withPersistent()` call.
- **BREAKING**: Remove generic type parameter 3 in `withPersistentMap()` call.
- Fix: Improve type inference in `withPersistentMap()` call in some cases.
- Fix: Update `peerDependencies` for `@cubux/storage-driver`.
- Upd: Interface `WithPersistentOptions` is now generic with 3 optional type
  parameters.
- Add: Options `serialize` for serialization before writing to driver and
  `unserialize` for unserialization after reading from driver.
- Add: Option `wakeUp` to set alternative target which will receive initial
  state read from driver on initialization.

## 0.1.0 (2022-09-06)

- First release.

# Changelog

## 0.3.0 (DEV)

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

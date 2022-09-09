# Changelog

## 0.2.0 (DEV)

- **BREAKING**: Remove generic type parameter 3 in `withPersistent()` call.
- **BREAKING**: Remove generic type parameter 3 in `withPersistentMap()` call.
- Fix: Improve type inference in `withPersistentMap()` call in some cases.
- Upd: Interface `WithPersistentOptions` is now generic with 3 optional type
  parameters.
- Add: Options `serialize` for serialization before writing to driver and
  `unserialize` for unserialization after reading from driver.
- Add: Option `wakeUp` to set alternative target which will receive initial
  state read from driver on initialization.

## 0.1.0 (2022-09-06)

- First release.

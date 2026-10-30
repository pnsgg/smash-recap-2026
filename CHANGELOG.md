# Changelog

## [1.2.0](https://github.com/pnsgg/smash-recap-2026/compare/smash-recap-v1.1.0...smash-recap-v1.2.0) (2026-10-30)


### Features

* acknowledge remotion license ([#87](https://github.com/pnsgg/smash-recap-2026/issues/87)) ([6f5abbc](https://github.com/pnsgg/smash-recap-2026/commit/6f5abbc1406af022e3af3d0012d4892fb487b28c))
* Arcade UI redesign, richer recap stats, and dynamic link previews ([#89](https://github.com/pnsgg/smash-recap-2026/issues/89)) ([f28cf9d](https://github.com/pnsgg/smash-recap-2026/commit/f28cf9d93c3441e566c1fc0ecfb44d3fbd82b458))
* **recap:** add timezone and local time conversion to tournaments ([#85](https://github.com/pnsgg/smash-recap-2026/issues/85)) ([049b8d8](https://github.com/pnsgg/smash-recap-2026/commit/049b8d8ffeb5daf5d32f98d8d1f56ac962b227d7))

## [1.1.0](https://github.com/pnsgg/smash-recap-2026/compare/smash-recap-v1.0.0...smash-recap-v1.1.0) (2026-10-18)


### Features

* cache recap data response ([#74](https://github.com/pnsgg/smash-recap-2026/issues/74)) ([4a24d4f](https://github.com/pnsgg/smash-recap-2026/commit/4a24d4fef2a375a628c75f4e5077a807c1d57b0a))
* **recap:** skip unmappable events and expose skippedEventCount in the response ([46dd6fb](https://github.com/pnsgg/smash-recap-2026/commit/46dd6fb938314180f008bae51fa3c863b9406ccf))
* **startgg:** retry requests on 429 with exponential backoff and Retry-After support ([dbca965](https://github.com/pnsgg/smash-recap-2026/commit/dbca965fb086f7cd0663e4d9574dcb81b8b952bc))


### Bug Fixes

* **recap:** exclude disqualification sets from totalSets count ([#76](https://github.com/pnsgg/smash-recap-2026/issues/76)) ([699efd8](https://github.com/pnsgg/smash-recap-2026/commit/699efd8a5f4862369a96dfe6572e5d12c21f6c0d))
* **recap:** key character and stage aggregations by ID instead of name ([#77](https://github.com/pnsgg/smash-recap-2026/issues/77)) ([ab3ba26](https://github.com/pnsgg/smash-recap-2026/commit/ab3ba26557f8ef02c0b24e4dbf3325d8be9bec28))
* **recap:** return false for reverse sweep when any game has no recor… ([#78](https://github.com/pnsgg/smash-recap-2026/issues/78)) ([1f58d8e](https://github.com/pnsgg/smash-recap-2026/commit/1f58d8e56bb14974f8e8e37a29b16788f1a197ed))
* **recap:** skip sets with unresolvable winnerId instead of silently assigning the wrong winner ([65998e6](https://github.com/pnsgg/smash-recap-2026/commit/65998e654188c4c37734591cce36b67d45f754e8))
* **recap:** use UTC day and month for tournament activity ([#80](https://github.com/pnsgg/smash-recap-2026/issues/80)) ([fde5705](https://github.com/pnsgg/smash-recap-2026/commit/fde57057d09480506a786890c52408350238e624))
* **recap:** use UTC day and month for tournament activity to avoid se… ([#79](https://github.com/pnsgg/smash-recap-2026/issues/79)) ([a5c8cc8](https://github.com/pnsgg/smash-recap-2026/commit/a5c8cc84ada902a564a6be5c2e3738b9e3d6ce96))
* **shared:** derive PlayerRecapProps from response schema instead of presenter return type ([495812f](https://github.com/pnsgg/smash-recap-2026/commit/495812fbee2dab36a3b1c5340c658ee119900583))
* **startgg:** throw UserNotFoundError when player has no gamerTag ([32345e4](https://github.com/pnsgg/smash-recap-2026/commit/32345e443508032c90b6d82fe45b4aa6d3ed6ac4))


### Performance Improvements

* **startgg:** minify GraphQL query string to reduce GET URL length ([cacb825](https://github.com/pnsgg/smash-recap-2026/commit/cacb825d690fb61f449345fb99015944b4dbf5b1))

## 1.0.0 (2026-09-27)


### Features

* add address model ([3fbd905](https://github.com/pnsgg/smash-recap-2026/commit/3fbd905014cd60a003a85deaf077f16b1bf60d1c))
* add bracketType to set ([e44ca8d](https://github.com/pnsgg/smash-recap-2026/commit/e44ca8da3307305e136dc2d72f4a51bc738b4df6))
* add character model ([00906aa](https://github.com/pnsgg/smash-recap-2026/commit/00906aab996649c5f817040a8d36765aa92c91e2))
* add domain class constructor preconditions and validation tests ([69520ea](https://github.com/pnsgg/smash-recap-2026/commit/69520eac015029386f25bc827d573e413ae24cfc))
* add domain models and tests ([8169a72](https://github.com/pnsgg/smash-recap-2026/commit/8169a724ddb55359153b72ac83a5b9b4d325d325))
* Add event type mapping and improve player resolution ([47b5a43](https://github.com/pnsgg/smash-recap-2026/commit/47b5a43c849e1e21a3fefb230593e4c37307512e))
* Add EventType conversion helper methods ([4c66830](https://github.com/pnsgg/smash-recap-2026/commit/4c668309fcc1c3e8169f806f26a111e10fc5a984))
* add eventType to event ([657c0a7](https://github.com/pnsgg/smash-recap-2026/commit/657c0a7ec4023161a61952680c27ad9c1037d196))
* add game and stage models ([891af1b](https://github.com/pnsgg/smash-recap-2026/commit/891af1b42522caade7b430327f1b31ba41cacdcc))
* add isOnline to event ([603731b](https://github.com/pnsgg/smash-recap-2026/commit/603731b36914356c6aa387a9b0c4aa4393f22fbf))
* add relationship between event and sets ([e21dbac](https://github.com/pnsgg/smash-recap-2026/commit/e21dbac3064817944a86054cfc17f32a953fc17a))
* add relationship between videogame and event ([52293a4](https://github.com/pnsgg/smash-recap-2026/commit/52293a4c4db9938c0ed871ba140a6bd2ea167574))
* add Set domain model ([d76ddfb](https://github.com/pnsgg/smash-recap-2026/commit/d76ddfb383b9c72b658e971d461c1a1569fc6da6))
* add videogame model ([af3d0b1](https://github.com/pnsgg/smash-recap-2026/commit/af3d0b1064c72045a60135ba6106940c0f55be25))
* check whether a set is an upset or not ([d5cbf3d](https://github.com/pnsgg/smash-recap-2026/commit/d5cbf3dbc00fa41241499c4cd4b5f9005e36b61c))
* compute distance for two address using lng and lat ([0870231](https://github.com/pnsgg/smash-recap-2026/commit/08702318a2ef31b113c421aab74ed609c109ee2c))
* compute SPR, RFV and upset factor ([630d887](https://github.com/pnsgg/smash-recap-2026/commit/630d887716271af7efbd2d1050804a279689063f))
* containerize the application ([161fa54](https://github.com/pnsgg/smash-recap-2026/commit/161fa54e5ddc8136bac1e28462963e9dbff83909))
* extract constructor parameter types and refactor preconditions to private helper methods ([17ee6b9](https://github.com/pnsgg/smash-recap-2026/commit/17ee6b9d94952b4b6158ebdc9beb1ca408619410))
* extract SeedParams constructor parameter type and refactor preconditions to private helper method ([f14ddd9](https://github.com/pnsgg/smash-recap-2026/commit/f14ddd99e239323bc5af1a3d50c05a015c4c8665))
* filter player recap by videogameId ([#64](https://github.com/pnsgg/smash-recap-2026/issues/64)) ([78392b8](https://github.com/pnsgg/smash-recap-2026/commit/78392b88692c3ed4309ba0dbf42b2a07d5917ca9))
* handle user not found ([f6e134f](https://github.com/pnsgg/smash-recap-2026/commit/f6e134f955c07fa405e7c852e44463784243b7b8))
* implement player recap stats ([4c2bcc3](https://github.com/pnsgg/smash-recap-2026/commit/4c2bcc392f78477714db1b9a309fe5eea56bb4b5))
* implement uniqueOpponentsFaced stats ([9dc8e4a](https://github.com/pnsgg/smash-recap-2026/commit/9dc8e4a8746b28512c1cd94cb328c62e4cce920b))
* **recap:** cluster tournaments into recurring series ([#73](https://github.com/pnsgg/smash-recap-2026/issues/73)) ([14460d8](https://github.com/pnsgg/smash-recap-2026/commit/14460d88f0165b4f62e4f75d6f0d48558f8e9a16))
* store last phase brackeType into event instead of blindly grabing ([3bc38b7](https://github.com/pnsgg/smash-recap-2026/commit/3bc38b7c5d5badbff633a96bfcbf628ca4f598c6))
* **web:** dockerize the frontend app ([6163408](https://github.com/pnsgg/smash-recap-2026/commit/6163408180bfb9d06d8dd5807cea96a45685f5ee))


### Bug Fixes

* do no count DQs as upset and therefore do not compute upset factor ([2cc7a1a](https://github.com/pnsgg/smash-recap-2026/commit/2cc7a1a029ecdf3e6020e6f2c083f6c2157aa457))
* exclude bin/test.ts ([db8deff](https://github.com/pnsgg/smash-recap-2026/commit/db8deffd94ec53dc0356accb3e1a0b5f7c5fb9f7))
* query event type ([cb71207](https://github.com/pnsgg/smash-recap-2026/commit/cb7120738fb7346fa6bf10d2f4c2154a86724727))
* query player id from participant ([e6586cb](https://github.com/pnsgg/smash-recap-2026/commit/e6586cb3e34347ed2b175a43b73a1c35d3d7d1f0))
* remove duplicate Character from Set ([231220b](https://github.com/pnsgg/smash-recap-2026/commit/231220bfa25307f1797a106e3fd8d04ee63107e6))

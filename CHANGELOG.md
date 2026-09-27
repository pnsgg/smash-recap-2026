# Changelog

## [1.1.0](https://github.com/pnsgg/smash-recap-2026/compare/smash-recap-v1.0.0...smash-recap-v1.1.0) (2026-09-27)


### Features

* cache recap data response ([#74](https://github.com/pnsgg/smash-recap-2026/issues/74)) ([4a24d4f](https://github.com/pnsgg/smash-recap-2026/commit/4a24d4fef2a375a628c75f4e5077a807c1d57b0a))

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

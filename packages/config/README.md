# Opinionated Rollup Configuration

This is my rollup configuration for building JavaScript libraries like `tsup`.

- `TypeScript`
- `CommonJS Plugin`
- `Alias Plugin`, default configure `@` to `src/`
- `Node Resolve Plugin`
- `dts`, generate `.d.ts`、`d.mts`、`d.cts` files

By default, There will be generate 3 folder:

```bash
dist/
  ├── cjs/  # CommonJS
  ├──── index.cjs
  ├──── index.d.cts # The typing
  ├── esm/  # ES Module
  ├──── index.mts
  ├──── index.d.mts # The typing
  ├── types/  # TypeScript Declaration
  ├──── index.d.ts # The typing

```

## Usage

It very easy to use, just install and create a `rollup.config.ts` file.

```bash
npm i @naiable/rollup-config -D
```

```ts
import naiup from "@naiable/rollup-config";

export default naiup();
```

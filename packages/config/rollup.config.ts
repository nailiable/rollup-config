import { presetLib } from "./src";

export default presetLib({
  input: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    alias: "src/libraries/alias.ts",
    commonjs: "src/libraries/commonjs.ts",
    resolve: "src/libraries/resolve.ts",
    swc: "src/libraries/swc.ts",
    typescript: "src/libraries/typescript.ts",
    dts: "src/libraries/dts.ts",
    vue: "src/libraries/vue.ts",
    esbuild: "src/libraries/esbuild.ts",
    babel: "src/libraries/babel.ts",
  },
  dir: "dist",
}).build();

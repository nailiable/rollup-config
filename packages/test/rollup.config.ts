import { presetApp } from "@naiable/rollup-config";

export default presetApp({
  compile: false,
  babel: {
    inputOptions: {
      babelHelpers: "bundled",
      plugins: ["babel-plugin-transform-typescript-metadata", ["@babel/plugin-proposal-decorators", { version: "2023-05" }]],
      presets: ["@babel/preset-typescript"],
      extensions: [".ts", ".tsx", ".mts", ".cts"],
    },
  },
  dts: false,
  output: ["esm"],
}).build();

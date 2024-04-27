import { existsSync } from "node:fs";
import { defu } from "defu";
import type { INaiablePreset } from "./type";
import type { INaiableRollupConfig } from "./index";
import naiup from "./index";

export function presetLib(mixin: INaiableRollupConfig = {}): INaiablePreset {
  const tsconfig = existsSync("tsconfig.build.json") ? "tsconfig.build.json" : "tsconfig.json";
  const config: INaiableRollupConfig = {
    input: {
      index: "src/index.ts",
    },
    dir: "lib",
    compile: {
      type: "@rollup/plugin-typescript",
      typescript: {
        target: "es2022",
        module: "es2022",
        tsconfig,
      },
    },
    preserveModules: true,
    dts: { tsconfig },
  };

  return {
    ...defu(mixin, config),
    build() {
      return naiup(this);
    },
  };
}

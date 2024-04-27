import { existsSync } from "node:fs";
import { defu } from "defu";
import type { INaiablePreset } from "./type";
import type { INaiableRollupConfig } from "./index";
import naiup from "./index";

export function presetApp(mixin: INaiableRollupConfig = {}): INaiablePreset {
  const config: INaiableRollupConfig = {
    input: "src/main.ts",
    dir: "dist",
    compile: {
      type: "@rollup/plugin-typescript",
      typescript: {
        target: "es2022",
        module: "es2022",
      },
    },
    dts: {
      tsconfig: existsSync("tsconfig.build.json") ? "tsconfig.build.json" : "tsconfig.json",
    },
    preserveModules: false,
    external(source) {
      if (/tslib/.test(source)) return false;
      if (/node_modules/.test(source)) return true;
      return false;
    },
  };

  return {
    ...defu(mixin, config),
    build() {
      return naiup(this);
    },
  };
}

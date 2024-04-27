import type { RollupOptions } from "rollup";
import type { INaiableRollupConfig } from "./index";

export type INaiablePreset = INaiableRollupConfig & {
  /** Directly output the build options. */
  build: () => RollupOptions[];
};

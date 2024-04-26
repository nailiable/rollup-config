import { dirname, join } from "node:path";
import fs from "node:fs";
import { defu } from "defu";
import type { InputOption, InputPluginOption, RollupOptions } from "rollup";
import type { RollupAliasOptions } from "@rollup/plugin-alias";
import alias from "@rollup/plugin-alias";
import type { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import commonjs from "@rollup/plugin-commonjs";
import type { RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import resolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import type { Options as RollupDTSOptions } from "rollup-plugin-dts";
import dts from "rollup-plugin-dts";
import type { FilterPattern } from "@rollup/pluginutils";
import type { RollupTypescriptOptions } from "@rollup/plugin-typescript";
import typescript from "@rollup/plugin-typescript";

export function writeFile(path: string, content: string): void {
  // 创建文件夹
  const dir = dirname(path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 删除已存在的文件
  if (fs.existsSync(path)) fs.unlinkSync(path);

  // 写入文件
  fs.writeFileSync(path, content);
}

export interface INaiableRollupCompileTypeScriptConfig {
  type: "@rollup/plugin-typescript";
  typescript?: RollupTypescriptOptions;
}
export interface INaiableRollupCompileSWCConfig {
  type: "@rollup/plugin-swc";
  /** SWC Options, import `@swc/core`'s `Config` interface to help configure */
  swc?: Record<string, any>;
  include?: FilterPattern;
  exclude?: FilterPattern;
}
export type INaiableRollupCompileConfig = INaiableRollupCompileTypeScriptConfig | INaiableRollupCompileSWCConfig;

export interface INaiableRollupConfig {
  input?: InputOption;
  output?: ("cjs" | "esm")[];
  dir?: string;
  alias?: RollupAliasOptions;
  commonjs?: RollupCommonJSOptions;
  resolve?: RollupNodeResolveOptions;
  compile?: INaiableRollupCompileConfig;
  dts?: RollupDTSOptions;
  strict?: boolean;
  sourcemap?: boolean | "inline" | "hidden";
  overrides?: {
    buildOptions?: RollupOptions;
    dtsOptions?: RollupOptions;
  };
  snapshot?: {
    enable: boolean;
    path?: string;
  };
}

export default function naiup(config: INaiableRollupConfig = {}): RollupOptions[] {
  const defaults: INaiableRollupConfig = {
    input: "src/index.ts",
    output: ["cjs", "esm"],
    strict: true,
    sourcemap: "inline",
    dir: "dist",
    alias: {
      entries: [{ find: "@", replacement: "src" }],
    },
    commonjs: {},
    resolve: {
      extensions: [".mjs", ".js", ".json", ".node", /* 附加 */ ".ts", ".tsx", ".cjs", ".jsx", ".mts", ".cts"],
    },
    compile: {
      type: "@rollup/plugin-typescript",
      typescript: {},
    },
    dts: {},
    overrides: {
      buildOptions: {},
      dtsOptions: {},
    },
    snapshot: {
      enable: false,
      path: `rollup.config.snapshot-${new Date().toISOString()}.json`,
    },
  };

  const finalConfig = defu(config, defaults);
  const finalPlugins: InputPluginOption[] = [
    alias(finalConfig.alias),
    commonjs(finalConfig.commonjs),
    resolve(finalConfig.resolve),
    finalConfig.compile.type === "@rollup/plugin-typescript" ? typescript(finalConfig.compile.typescript) : swc(finalConfig.compile),
  ];

  const [defaultComputedBuildOptions, defaultComputedDtsOptions] = [
    {
      input: finalConfig.input,
      external: [/node_modules/],
      plugins: [...finalPlugins],
      output: [...new Set(finalConfig.output)].map((format) => ({
        format,
        dir: join(finalConfig.dir, format),
        entryFileNames: `[name].${format === "cjs" ? "cjs" : "mjs"}`,
        strict: finalConfig.strict,
        sourcemap: finalConfig.sourcemap,
      })),
    },
    {
      input: finalConfig.input,
      external: [/node_modules/],
      plugins: [...finalPlugins, dts(finalConfig.dts)],
      output: [
        ...[...new Set(finalConfig.output)].map((format) => ({
          format,
          dir: join(finalConfig.dir, format),
          entryFileNames: `[name].d.${format === "cjs" ? "cts" : "mts"}`,
          strict: finalConfig.strict,
          sourcemap: finalConfig.sourcemap,
        })),
        {
          dir: join(finalConfig.dir, "types"),
          entryFileNames: "[name].d.ts",
          strict: finalConfig.strict,
          sourcemap: finalConfig.sourcemap,
        },
      ],
    },
  ];

  const finalBuildOptions = defu(finalConfig.overrides.buildOptions, defaultComputedBuildOptions);
  const finalDtsOptions = defu(finalConfig.overrides.dtsOptions, defaultComputedDtsOptions);

  if (finalConfig.snapshot.enable && finalConfig.snapshot.path)
    writeFile(finalConfig.snapshot.path, JSON.stringify([finalBuildOptions, finalDtsOptions]));

  return [finalBuildOptions, finalDtsOptions];
}

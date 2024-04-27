import { dirname, join } from "node:path";
import fs from "node:fs";
import { defu } from "defu";
import type { ExternalOption, InputOption, InputPluginOption, RollupOptions } from "rollup";
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
  /** Use `@rollup/plugin-typescript`! */
  type: "@rollup/plugin-typescript";
  /** TypeScript Options. */
  typescript?: RollupTypescriptOptions;
}
export interface INaiableRollupCompileSWCConfig {
  /** Use `@rollup/plugin-swc`! */
  type: "@rollup/plugin-swc";
  /** SWC Options, import `@swc/core`'s `Config` interface to help configure */
  swc?: Record<string, any>;
  /** Include and exclude files. */
  include?: FilterPattern;
  /** Include and exclude files. */
  exclude?: FilterPattern;
}
export type INaiableRollupCompileConfig = INaiableRollupCompileTypeScriptConfig | INaiableRollupCompileSWCConfig;

export interface INaiableRollupConfig {
  /** The input file. @default 'src/index.ts' */
  input?: InputOption;
  /** The output format. @default ['cjs', 'esm'] */
  output?: ("cjs" | "esm")[];
  /** The output directory. @default 'dist' */
  dir?: string;
  /** The `@rollup/plugin-alias` options. Default alias `@` to `src`. */
  alias?: RollupAliasOptions;
  /** The `@rollup/plugin-commonjs` options. */
  commonjs?: RollupCommonJSOptions;
  /** The `@rollup/plugin-node-resolve` options. Default extensions include `.ts`, `.tsx`, `.cjs`, `.jsx`, `.mts`, `.cts`. */
  resolve?: RollupNodeResolveOptions;
  /** Use `@rollup/plugin-typescript` or `@rollup/plugin-swc` ? */
  compile?: INaiableRollupCompileConfig;
  /** The `d.ts` build options. */
  dts?: RollupDTSOptions | false;
  /** Use strict. @default true */
  strict?: boolean;
  /** Source map. @default inline */
  sourcemap?: boolean | "inline" | "hidden";
  /** Free override rollup config */
  overrides?: {
    /** The `Build` options. */
    buildOptions?: RollupOptions;
    /** The `d.ts` build options. */
    dtsOptions?: RollupOptions;
  };
  /** Generate a snapshot json file when builded. */
  snapshot?: {
    /** Enable snapshot. @default false */
    enable: boolean;
    /** The snapshot file path. @default `rollup.config.snapshot-${new Date().toISOString()}.json` */
    path?: string;
  };
  /** Preserve modules. @default true */
  preserveModules?: boolean;
  /** External dependencies. @default [/node_modules/] */
  external?: ExternalOption;
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
    preserveModules: true,
    external: [/node_modules/],
  };

  const finalConfig = defu(config, defaults);
  const finalPlugins: InputPluginOption[] = [
    alias(finalConfig.alias),
    commonjs(finalConfig.commonjs),
    resolve(finalConfig.resolve),
    finalConfig.compile.type === "@rollup/plugin-typescript"
      ? typescript({
          ...finalConfig.compile.typescript,
        })
      : swc({
          ...finalConfig.compile,
        }),
  ];

  const defaultComputedBuildOptions: RollupOptions = {
    input: finalConfig.input,
    external: finalConfig.external,
    plugins: [...finalPlugins],
    output: [...new Set(finalConfig.output)].map((format) => ({
      format,
      dir: join(finalConfig.dir, format),
      entryFileNames: `[name].${format === "cjs" ? "cjs" : "mjs"}`,
      strict: finalConfig.strict,
      sourcemap: finalConfig.sourcemap,
      preserveModules: finalConfig.preserveModules,
    })),
  };

  let defaultComputedDtsOptions: RollupOptions | undefined;
  if (finalConfig.dts !== false) {
    defaultComputedDtsOptions = {
      input: finalConfig.input,
      external: finalConfig.external,
      plugins: [...finalPlugins, dts(finalConfig.dts)],
      output: [
        ...[...new Set(finalConfig.output)].map((format) => ({
          format,
          dir: join(finalConfig.dir, format),
          entryFileNames: `[name].d.${format === "cjs" ? "cts" : "mts"}`,
          strict: finalConfig.strict,
          sourcemap: finalConfig.sourcemap,
          preserveModules: finalConfig.preserveModules,
        })),
        {
          dir: join(finalConfig.dir, "types"),
          entryFileNames: "[name].d.ts",
          strict: finalConfig.strict,
          sourcemap: finalConfig.sourcemap,
          preserveModules: finalConfig.preserveModules,
        },
      ],
    };
  }

  const finalBuildOptions = defu(finalConfig.overrides.buildOptions, defaultComputedBuildOptions);
  const finalDtsOptions = defaultComputedDtsOptions ? defu(finalConfig.overrides.dtsOptions, defaultComputedDtsOptions) : undefined;

  const returns = finalDtsOptions ? [finalBuildOptions, finalDtsOptions] : [finalBuildOptions];

  if (finalConfig.snapshot.enable && finalConfig.snapshot.path) writeFile(finalConfig.snapshot.path, JSON.stringify(returns));

  return returns;
}

export * from "./preset-app";
export * from "./preset-lib";

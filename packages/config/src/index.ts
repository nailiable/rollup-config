import { dirname, join } from "node:path";
import fs from "node:fs";
import { defu } from "defu";
import type { ExternalOption, InputOption, InputPluginOption, OutputOptions, RollupOptions } from "rollup";
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
import vue from "unplugin-vue/rollup";
import esbuild from "rollup-plugin-esbuild";
import type { RollupBabelInputPluginOptions, RollupBabelOutputPluginOptions } from "@rollup/plugin-babel";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

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
  /** SWC Options */
  swc?: Parameters<typeof swc>[0];
  /** Include and exclude files. */
  include?: FilterPattern;
  /** Include and exclude files. */
  exclude?: FilterPattern;
}
export interface INaiableRollupComplieEsbuildConfig {
  /** Use `rollup-plugin-esbuild`! */
  type: "rollup-plugin-esbuild";
  /** Esbuild Options. */
  esbuild?: Parameters<typeof esbuild>[0];
}
export type INaiableRollupCompileConfig = INaiableRollupCompileTypeScriptConfig | INaiableRollupCompileSWCConfig | INaiableRollupComplieEsbuildConfig;

export interface INaiableBabelOptions {
  inputOptions?: RollupBabelInputPluginOptions | false;
  outputOptions?: RollupBabelOutputPluginOptions | false;
}
export interface INaiableRollupConfig {
  /** The input file. @default 'src/index.ts' */
  input?: InputOption;
  /** The output format. @default ['cjs', 'esm'] */
  output?: ("cjs" | "esm")[];
  /** The output directory. @default 'dist' */
  dir?: string;
  /** The `@rollup/plugin-alias` options. Default alias `@` to `src`. */
  alias?: RollupAliasOptions | false;
  /** The `@rollup/plugin-commonjs` options. */
  commonjs?: RollupCommonJSOptions | false;
  /** The `@rollup/plugin-node-resolve` options. Default extensions include `.ts`, `.tsx`, `.cjs`, `.jsx`, `.mts`, `.cts`. */
  resolve?: RollupNodeResolveOptions | false;
  /** Use `@rollup/plugin-typescript` or `@rollup/plugin-swc` or `rollup-plugin-esbuild` ? */
  compile?: INaiableRollupCompileConfig | false;
  /** The `d.ts` build options. */
  dts?: RollupDTSOptions | false;
  /** The `unplugin-vue` options. */
  vue?: Parameters<typeof vue>[0] | false;
  /** The `@rollup/plugin-babel` options. */
  babel?: INaiableBabelOptions | false;
  /** The `@rollup/plugin-terser` options. */
  terser?: Parameters<typeof terser>[0] | false;
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
    vue: {
      include: /\.vue$/,
      sourceMap: true,
    },
    babel: false,
    terser: false,
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
  if (config && config.output && Array.isArray(config.output)) finalConfig.output = config.output;

  const finalPlugins: InputPluginOption[] = [];
  const finalOutputPlugins = [];

  if (finalConfig.alias !== false) finalPlugins.push(alias(finalConfig.alias));
  if (finalConfig.commonjs !== false) finalPlugins.push(commonjs(finalConfig.commonjs));
  if (finalConfig.resolve !== false) finalPlugins.push(resolve(finalConfig.resolve));
  if (finalConfig.vue !== false) finalPlugins.push(vue(finalConfig.vue));
  if (finalConfig.babel !== false) {
    if (finalConfig.babel.inputOptions !== false) finalPlugins.push(babel(finalConfig.babel.inputOptions));
    if (finalConfig.babel.outputOptions !== false) finalOutputPlugins.push(getBabelOutputPlugin(finalConfig.babel.outputOptions));
  }

  if (finalConfig.compile !== false) {
    const complieOptions = finalConfig.compile as INaiableRollupCompileConfig;
    if (complieOptions.type === "@rollup/plugin-swc") finalPlugins.push(swc(complieOptions.swc));
    else if (complieOptions.type === "@rollup/plugin-typescript") finalPlugins.push(typescript(complieOptions.typescript));
    else if (complieOptions.type === "rollup-plugin-esbuild") finalPlugins.push(esbuild(complieOptions.esbuild));
  }

  if (finalConfig.terser !== false) finalOutputPlugins.push(terser(finalConfig.terser));

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
      plugins: [...finalOutputPlugins],
    })),
  };

  let defaultComputedDtsOptions: RollupOptions | undefined;
  if (finalConfig.dts !== false) {
    defaultComputedDtsOptions = {
      input: finalConfig.input,
      external: finalConfig.external,
      plugins: [...finalPlugins, dts(finalConfig.dts)],
      output: [
        ...[...new Set(finalConfig.output)].map(
          (format) =>
            ({
              format,
              dir: join(finalConfig.dir, format),
              entryFileNames: `[name].d.${format === "cjs" ? "cts" : "mts"}`,
              strict: finalConfig.strict,
              sourcemap: finalConfig.sourcemap,
              preserveModules: finalConfig.preserveModules,
            } as OutputOptions)
        ),
        {
          dir: join(finalConfig.dir, "types"),
          entryFileNames: "[name].d.ts",
          strict: finalConfig.strict,
          sourcemap: finalConfig.sourcemap,
          preserveModules: finalConfig.preserveModules,
        } as OutputOptions,
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

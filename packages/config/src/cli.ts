import child_process from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);

child_process.spawnSync("npx", args.length === 0 ? ["rollup", "-c", "rollup.config.ts", "--configPlugin", "@rollup/plugin-swc"] : args, {
  shell: true,
  stdio: "inherit",
});

import { presetLib } from "./src";

export default presetLib({
  input: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  dir: "dist",
}).build();

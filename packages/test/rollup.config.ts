import naiup from "@naiable/rollup-config";

export default naiup({
  compile: {
    type: "@rollup/plugin-typescript",
    typescript: {
      module: "es2022",
      target: "es2022",
    },
  },
});

const antfu = require("@antfu/eslint-config");

module.exports = antfu.default({
  rules: {
    "no-console": ["error", { allow: ["dir", "error"] }],
  },
});

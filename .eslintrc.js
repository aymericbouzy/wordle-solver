/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier",
  ],
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ["**/*.spec.ts"],
      env: { jest: true },
    },
    {
      files: ["*.js"],
      env: { node: true },
    },
  ],
};

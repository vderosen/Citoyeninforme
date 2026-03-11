import tsEslintParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".expo/",
      "coverage/",
      "video-demo/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];

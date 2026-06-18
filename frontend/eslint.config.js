import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactDom from "eslint-plugin-react-dom";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  globalIgnores(["dist", "src/shadcn", "src/api/generated", ".vite"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactDom.configs.recommended,
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      // Turn off duplicate react-x rule (already in react-hooks)
      "react-x/set-state-in-effect": "off",
      "react-x/purity": "off",
      "react-x/exhaustive-deps": "off",
    },
  },
]);

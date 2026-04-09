import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.mjs"],
  },
  eslint.configs.all,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs["flat/all"],
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "sort-imports": "off",
      "no-ternary": "off",
      "one-var": "off",
      "no-undefined": "off",
      "id-length": "off",
      "no-magic-numbers": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "max-lines": "off",
      "sort-keys": "off",
      "no-plusplus": "off",
      "capitalized-comments": "off",
      "no-inline-comments": "off",
      "line-comment-position": "off",
      "no-continue": "off",
      "func-style": ["error", "declaration"],
      "no-console": "error",
      "no-warning-comments": "error",
      "prefer-destructuring": "off",
      "no-bitwise": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
      ],

      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-process-exit": "off",
      "unicorn/import-style": ["error", { styles: { "node:path": { named: true } } }],
      "unicorn/numeric-separators-style": "off",
    },
  },
);

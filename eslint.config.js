import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import unusedImports from "eslint-plugin-unused-imports";




export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    settings: {
      react: {
        version: 'detect'
      }
    },
    ignores: [
    ],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",

      'react/no-string-refs': 'off',
      'react/display-name': 'off',
      'react/no-direct-mutation-state': 'off',
      'react/prop-types': 'off',
      'react/require-render-return': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-danger-with-children': 'off',
      'react/no-children-prop': 'off',

      // todo fix
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      'no-constant-binary-expression': 'off',
      'no-this-alias': 'off',
      'no-empty': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react/no-unknown-property': 'off',
      'react/jsx-key': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-case-declarations': 'off',
      'no-prototype-builtins': 'off',
    }
  }
];

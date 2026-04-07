import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import drizzle from 'eslint-plugin-drizzle';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import eslintJS from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import js from '@eslint/js';
import depend from 'eslint-plugin-depend';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...js.configs.recommended,
  reactCompiler.configs.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,
  eslintJS.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      drizzle,
      depend,
    },
    rules: {
      'drizzle/enforce-delete-with-where': 'warn',
      'drizzle/enforce-update-with-where': 'warn',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;

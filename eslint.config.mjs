import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  }
)

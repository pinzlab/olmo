import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'base/index': 'src/base/index.ts',
    'input/index': 'src/input/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false // Adjust if you want minified builds for production
})

import { defineConfig } from 'tsup';

const baseConfig = {
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true
};

export default defineConfig([
  {
    ...baseConfig,
    format: ['esm'],
    outDir: 'dist/esm',
    dts: true
  },
  {
    ...baseConfig,
    format: ['cjs'],
    outDir: 'dist/cjs',
    dts: true
  }
]);

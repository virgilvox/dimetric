import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['@dimetric/core', '@dimetric/renderer', 'pixi.js', 'pixi-viewport'],
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'DimetricRuntime',
    outDir: 'dist',
    outExtension: () => ({ js: '.iife.js' }),
    sourcemap: true,
    noExternal: ['@dimetric/core'],
    external: ['pixi.js', 'pixi-viewport', '@dimetric/renderer'],
  },
]);

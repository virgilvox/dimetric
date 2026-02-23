import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@dimetric/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@dimetric/renderer': resolve(__dirname, '../../packages/renderer/src/index.ts'),
      '@dimetric/runtime': resolve(__dirname, '../../packages/runtime/src/index.ts'),
    },
  },
});

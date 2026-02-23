import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@dimetric/core': resolve(__dirname, '../core/src/index.ts'),
      '@dimetric/formats': resolve(__dirname, '../formats/src/index.ts'),
      '@dimetric/renderer': resolve(__dirname, '../renderer/src/index.ts'),
      '@dimetric/runtime': resolve(__dirname, '../runtime/src/index.ts'),
    },
  },
});

import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/core',
  'packages/formats',
  'packages/renderer',
  'packages/runtime',
]);

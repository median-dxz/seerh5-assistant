import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    './packages/core/vitest.config.ts',
    './packages/launcher/vite.config.ts',
    './packages/server/vitest.config.ts'
]);

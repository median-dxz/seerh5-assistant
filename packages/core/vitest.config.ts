import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        watchExclude: ['**/node_modules/**'],
        coverage: {
            reportsDirectory: 'test/coverage',
        },
    },
});

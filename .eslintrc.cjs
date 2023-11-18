module.exports = {
    env: {
        browser: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./packages/app/tsconfig.json', './packages/core/tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['types', 'packages/backend', 'packages/sdk', 'packages/core/test', '.*rc.cjs'],
    root: true,
};

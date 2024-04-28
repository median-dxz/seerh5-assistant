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
        project: [
            './packages/launcher/tsconfig.json',
            './packages/core/tsconfig.json',
            './packages/server/tsconfig.json',
            './packages/mod-type/tsconfig.json',
        ],
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['types', '.*rc.cjs', '/scripts', '/sdk', '/website'],
    root: true,
};

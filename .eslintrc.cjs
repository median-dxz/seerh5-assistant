module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./packages/app/tsconfig.json', './packages/core/tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['/types', '/entry', 'sa.*.ts', '.*rc.cjs'],
    root: true,
};

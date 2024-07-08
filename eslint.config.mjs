// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import reactRefresh from 'eslint-plugin-react-refresh';
// TODO: 等待以下插件的FlatConfig与ESLint9支持
// import react from "eslint-plugin-react"
import reactHooks from 'eslint-plugin-react-hooks';
// import reactJsxA11y from "eslint-plugin-jsx-a11y"

export default tsEslint.config(
    {
        ignores: [
            'scripts/',
            'sdk/',
            'website/',
            '**/dist/',
            '**/test/',
            '**/\\.*rc',
            '**/*.config.*',
            'packages/core/types/',
            'packages/launcher/build-plugins/',
            'packages/server/entry/',
            'packages/server/mods/',
            'packages/server/launcher',
            'packages/server/typescript-hooks.mjs'
        ]
    },
    eslint.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    tsEslint.configs.stylisticTypeChecked[2],
    {
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                projectService: true
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            'arrow-body-style': ['error', 'as-needed'],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '_',
                    caughtErrors: 'none'
                }
            ],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowNullish: true
                }
            ],
            '@typescript-eslint/prefer-promise-reject-errors': 'off',
            '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],
            '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
            '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
            '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
            '@typescript-eslint/no-confusing-void-expression': [
                'error',
                { ignoreArrowShorthand: true, ignoreVoidOperator: true }
            ],
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: false
                }
            ],
            '@typescript-eslint/no-extraneous-class': 'off'
        }
    },
    {
        files: ['**/*.js'],
        ...tsEslint.configs.disableTypeChecked
    },
    // @sea/core
    {
        files: ['packages/core/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    // @sea/launcher
    {
        files: ['packages/launcher/src/**/*.ts', 'packages/launcher/src/**/*.tsx'],
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            'react-refresh': reactRefresh,
            // @ts-expect-error
            'react-hooks': reactHooks
            // 'jsx-a11y': reactJsxA11y,
            // 'react': react
        },
        // @ts-expect-error
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn' // swr 当前版本解构出的 error 只能推导出 any
        }
    },
    // @sea/server
    {
        files: ['packages/server/**/src/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    },
    {
        files: ['packages/mod-type/*.d.ts'],
        rules: {
            '@typescript-eslint/no-extraneous-class': 'off'
        }
    }
);


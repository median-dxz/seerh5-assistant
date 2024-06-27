//@ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import reactRefresh from 'eslint-plugin-react-refresh';
// TODO: 等待以下插件的FlatConfig与ESLint9支持
// import react from "eslint-plugin-react"
// import reactHooks from 'eslint-plugin-react-hooks';
// import reactJsxA11y from "eslint-plugin-jsx-a11y"

export default tsEslint.config(
    {
        ignores: [
            'scripts/',
            'sdk/',
            'website/',
            '**/dist/',
            '**/\\.*rc',
            '**/*.config.*',
            'packages/core/tests/',
            'packages/core/types/',
            'packages/launcher/core-e2e-test/',
            'packages/launcher/build-plugins/',
            'packages/server/entry/',
            'packages/server/mods/',
            'packages/server/launcher',
            'packages/server/typescript-hooks.mjs'
        ]
    },
    eslint.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
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
            '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }]
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
            'react-refresh': reactRefresh
            // 'react-hooks': reactHooks,
            // 'jsx-a11y': reactJsxA11y,
        },
        rules: {
            'react-refresh/only-export-components': 'warn'
        }
    },
    // @sea/server
    {
        files: ['packages/server/**/src/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false
                    }
                }
            ]
        }
    }
);


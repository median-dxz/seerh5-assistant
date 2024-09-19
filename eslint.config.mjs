// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

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
                // @ts-ignore
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
                    vars: 'local',
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'none'
                }
            ],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/unbound-method': 'off',
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
            '@typescript-eslint/no-invalid-void-type': 'off',
            '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],
            '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
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
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/no-namespace': [
                'error',
                {
                    allowDeclarations: true,
                    allowDefinitionFiles: true
                }
            ]
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
        },
        rules: {
            '@typescript-eslint/unbound-method': 'warn'
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
        settings: {
            react: {
                version: '18.3'
            }
        },
        plugins: {
            'react-refresh': reactRefresh,
            // @ts-expect-error
            'react-hooks': reactHooks,
            react: react
        },
        rules: {
            ...react.configs.flat.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': 'warn',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off'
        }
    },
    // @sea/server
    {
        files: ['packages/server/src/**/*.ts'],
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

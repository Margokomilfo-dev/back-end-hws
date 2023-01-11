module.exports = {
    env: {
        browser: true,
        node: true,
        amd: true,
        es2021: true,
    },
    root: true,
    extends: ['prettier', 'prettier/prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'no-duplicate-imports': ['error', { includeExports: true }],
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-debugger': 'warn',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}

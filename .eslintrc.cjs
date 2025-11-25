module.exports = {
    root: true,
    plugins: ['import'],
    rules: {
        'import/no-cycle': [
            'error',
            {
                // https://github.com/import-js/eslint-plugin-import/issues/1647
                ignoreExternal: false
            }
        ]
    },
    settings: {
        'import/resolver': {
            exports: {
                require: true
            }
        }
    },
    overrides: [
        {
            files: ['**/*.cjs'],
            env: {
                node: true,
                commonjs: true
            },
            parserOptions: {
                sourceType: 'script',
                ecmaVersion: 'latest'
            }
        },
        {
            files: ['**/*.{js,mjs}'],
            env: {
                node: true
            },
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest'
            }
        }
    ]
};

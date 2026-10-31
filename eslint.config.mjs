import typescript from 'typescript-eslint';

export default [
  {
    ignores: [
      'lib',
      'pratical-examples/messaging-js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescript.parser,
      parserOptions: {
        projectService: true,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': typescript.plugin,
    },
    rules: {
      indent: ['error', 2],
      'no-trailing-spaces': 'warn',
      semi: ['error', 'always'],
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'no-warning-comments': ['warn', { terms: ['TODO', 'FIX'], location: 'start' }],
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      }],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
];

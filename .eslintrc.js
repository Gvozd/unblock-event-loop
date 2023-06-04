module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'eslint:all',
    'standard-with-typescript',
    'airbnb-base',
  ],
  overrides: [
    {
      files: '*.ts',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/all',
        'airbnb-typescript/base',
      ],
      rules: {
        '@typescript-eslint/promise-function-async': 0, // TODO - 2
        '@typescript-eslint/parameter-properties': 0,
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 0,
  },
};

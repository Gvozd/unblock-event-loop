module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
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
        'airbnb-typescript/base',
      ],
      rules: {
        '@typescript-eslint/promise-function-async': 0, // TODO - 2
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

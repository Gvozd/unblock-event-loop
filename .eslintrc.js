module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'standard-with-typescript',
  overrides: [
    {
      files: '*.ts',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/semi': [2, 'always'],
        '@typescript-eslint/comma-dangle': [2, 'always-multiline'],
        '@typescript-eslint/promise-function-async': 0, // TODO - 2
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    semi: [2, 'always'],
    'comma-dangle': [2, 'always-multiline'],
  },
};

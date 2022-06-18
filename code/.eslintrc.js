module.exports = {
  env: {
    jest: true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
  },
  plugins: ['react'],
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-underscore-dangle': 'off',
  },
  settings: {
    react: {
      version: 'latest',
    },
  },
};

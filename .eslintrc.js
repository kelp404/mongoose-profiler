module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'xo',
    'xo-space'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {},
    ecmaVersion: 2018
  },
  plugins: [],
  rules: {
    'no-eq-null': 0,
    eqeqeq: ['error', 'allow-null']
  }
};

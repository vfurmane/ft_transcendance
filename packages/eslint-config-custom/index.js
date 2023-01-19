module.exports = {
  extends: ["turbo", "prettier"],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': ['warn'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/prefer-readonly': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn', { 'ignoreRestSiblings': true }],
    'sort-imports': ['warn', { 'ignoreCase': true }]
  },
};

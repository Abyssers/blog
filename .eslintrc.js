/**
 * rules: https://eslint.bootcss.com/docs/rules
 */
module.exports = {
    root: true,
    env: {
        es6: true,
        browser: true,
        node: true,
    },

    extends: ["eslint:recommended", "plugin:prettier/recommended"],

    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false, // for @babel/eslint-parser
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },

    rules: {
        "brace-style": ["error", "1tbs", { allowSingleLine: true }],
        "comma-spacing": ["error", { before: false, after: true }],
        "array-bracket-spacing": ["error", "never"],
        "no-constant-condition": "off",
        "no-undef": "warn",
        "no-unused-vars": "warn",
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    },
};

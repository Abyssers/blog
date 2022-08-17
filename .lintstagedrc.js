/**
 * configuration: https://github.com/okonet/lint-staged#Configuration
 */
module.exports = {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"],
    "*.yml": ["prettier --write"],
};

/**
 * configuration: https://github.com/okonet/lint-staged#Configuration
 */
module.exports = {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,jsonc}": ["prettier --write"],
    "*.{yml,yaml}": ["prettier --write"],
    "source/**/*.{md,markdown}": ["node scripts/matter.lint.js --map created:date --now --write"],
    "*.{md,markdown}": ["node scripts/matter.lint.js --map created:date --now --write", "markdownlint-cli2"],
};

module.exports = {
  locales: ["en", "ja"],
  output: "src/i18n/translations/$LOCALE.yml",
  input: ["src/**/*.{ts,tsx}"],
  // allow keys to be phrases having `:`, `.`
  namespaceSeparator: false,
  keySeparator: false,
  createOldCatalogs: false,
};

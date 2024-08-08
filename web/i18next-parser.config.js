export default {
  locales: ["en", "ja", "es"],
  output: "src/services/i18n/translations/$LOCALE.yml",
  input: ["src/**/*.{ts,tsx}"],
  // allow keys to be phrases having `:`, `.`
  namespaceSeparator: false,
  keySeparator: false,
  createOldCatalogs: false,
};

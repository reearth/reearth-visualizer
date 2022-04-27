module.exports = {
  locales: ["en", "ja"],
  output: "src/i18n/translations/$LOCALE.yml",
  input: ["src/**/*.{ts,tsx}"],
  useKeysAsDefaultValue: true,
};

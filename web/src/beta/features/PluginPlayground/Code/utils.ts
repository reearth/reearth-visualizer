const REEARTH_HTML_INJECTION_PATTERN =
  /reearth\.(ui|modal|popup)\.show\(\s*(['"`])([^]*?)\2\s*\);/;

export const extractHtmlFromSourceCode = (sourceCode: string) => {
  const match = REEARTH_HTML_INJECTION_PATTERN.exec(sourceCode);
  return match?.[3];
};

export const injectHtmlIntoSourceCode = (
  htmlSourceCode: string,
  sourceCode: string
) => {
  return sourceCode.replace(
    REEARTH_HTML_INJECTION_PATTERN,
    (_, type) => `reearth.${type}.show(\`${htmlSourceCode}\`);`
  );
};

export const getLanguageByFileExtension = (fileTitle: string) => {
  const ext = fileTitle.split(".").pop();
  switch (ext) {
    case "js":
      return "javascript";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return "plaintext";
  }
};

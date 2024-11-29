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

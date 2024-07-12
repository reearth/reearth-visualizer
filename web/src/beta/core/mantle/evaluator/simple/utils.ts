const usableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateRandomString = (len: number): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(len)))
    .map(n => usableChars[n % len])
    .join("")
    .toLowerCase();
};

export const recursiveJSONParse = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      try {
        if (obj[key].startsWith("{") && obj[key].endsWith("}")) {
          obj[key] = JSON.parse(obj[key]);
        }
      } catch (error) {
        console.error("Invalid JSON:", obj[key]);
      }
    } else if (typeof obj[key] === "object") {
      obj[key] = recursiveJSONParse(obj[key]);
    }
  }

  return obj;
};

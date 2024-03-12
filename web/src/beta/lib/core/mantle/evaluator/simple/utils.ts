import { pick } from "lodash-es";
import LRU from "lru-cache";

import { Feature, StyleExpression } from "../../types";

const usableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateRandomString = (len: number): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(len)))
    .map(n => usableChars[n % len])
    .join("")
    .toLowerCase();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const JSONPATH_IDENTIFIER = "REEARTH_JSONPATH";
const ID_IDENTIFIER = "REEARTH_ID";
const MAX_CACHE_SIZE = 1000;

export function getCacheableProperties(styleExpression: StyleExpression, feature?: Feature) {
  const ref = getCombinedReferences(styleExpression);
  const keys = ref.includes(JSONPATH_IDENTIFIER) ? Object.keys(feature?.properties) : null;
  const properties = ref.includes(ID_IDENTIFIER)
    ? { id: feature?.id }
    : pick(feature?.properties, keys || ref);
  return properties;
}

export function getCombinedReferences(expression: StyleExpression): string[] {
  if (typeof expression === "string") {
    return getReferences(expression);
  } else {
    const references: string[] = [];
    for (const [condition, value] of expression.conditions) {
      references.push(...getReferences(condition), ...getReferences(value));
    }
    return references;
  }
}

const cache = new LRU<string, string[]>({ max: MAX_CACHE_SIZE });

export function getReferences(expression: string): string[] {
  const cachedResult = cache.get(expression);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result: string[] = [];
  let exp = expression;
  let i = exp.indexOf("${");
  const varExpRegex = /^\$./;

  while (i >= 0) {
    const openSingleQuote = exp.indexOf("'", i);
    const openDoubleQuote = exp.indexOf('"', i);

    if (openSingleQuote >= 0 && openSingleQuote < i) {
      const closeQuote = exp.indexOf("'", openSingleQuote + 1);
      result.push(exp.substring(0, closeQuote + 1));
      exp = exp.substring(closeQuote + 1);
    } else if (openDoubleQuote >= 0 && openDoubleQuote < i) {
      const closeQuote = exp.indexOf('"', openDoubleQuote + 1);
      result.push(exp.substring(0, closeQuote + 1));
      exp = exp.substring(closeQuote + 1);
    } else {
      const j = exp.indexOf("}", i);
      if (j < 0) {
        return result;
      }
      const varExp = exp.slice(i + 2, j);
      if (varExp === "id") {
        return [ID_IDENTIFIER];
      }
      if (varExpRegex.test(varExp)) {
        return [JSONPATH_IDENTIFIER];
      } else {
        result.push(exp.substring(i + 2, j));
      }
      exp = exp.substring(j + 1);
    }
    i = exp.indexOf("${");
  }

  cache.set(expression, result);
  return result;
}

import { JSONPath } from "jsonpath-plus";

import { JPLiteral } from "./expression";
import { generateRandomString } from "./utils";

export function replaceVariables(expression: string, feature?: any): [string, JPLiteral[]] {
  let exp = expression;
  let result = "";
  const literalJP: JPLiteral[] = [];
  let i = exp.indexOf("${");
  const featureDefined = typeof feature !== "undefined";
  const jsonPathCache: Record<string, any[]> = {};
  const varExpRegex = /^\$./;
  while (i >= 0) {
    if (isInsideQuotes(exp, i)) {
      const closeQuote = findCloseQuote(exp, i);
      result += exp.slice(0, closeQuote + 1);
      exp = exp.slice(closeQuote + 1);
      i = exp.indexOf("${");
    } else {
      result += exp.slice(0, i);
      const j = getCloseBracketIndex(exp, i);
      const varExp = exp.slice(i + 2, j);
      if (varExpRegex.test(varExp)) {
        if (!featureDefined) {
          return [result, []];
        }
        let res = jsonPathCache[varExp];
        if (!res) {
          try {
            res = JSONPath({ json: feature, path: varExp });
            jsonPathCache[varExp] = res;
          } catch (error) {
            return [result, []];
          }
        }
        if (res.length == 1) {
          const placeholderLiteral = generateRandomString(10);
          literalJP.push({
            literalName: placeholderLiteral,
            literalValue: res[0],
          });
          result += placeholderLiteral;
        } else {
          return [result, []];
        }
      } else {
        const replacedVarExp = replaceReservedWord(varExp);
        result += `czm_${replacedVarExp}`;
      }
      exp = exp.slice(j + 1);
      i = exp.indexOf("${");
    }
  }
  result += exp;
  return [result, literalJP];
}

function isInsideQuotes(exp: string, index: number): boolean {
  const openSingleQuote = exp.indexOf("'");
  const openDoubleQuote = exp.indexOf('"');
  if (openSingleQuote >= 0 && openSingleQuote < index) {
    const closeQuote = exp.indexOf("'", openSingleQuote + 1);
    return closeQuote >= index;
  } else if (openDoubleQuote >= 0 && openDoubleQuote < index) {
    const closeQuote = exp.indexOf('"', openDoubleQuote + 1);
    return closeQuote >= index;
  }
  return false;
}

function findCloseQuote(exp: string, index: number): number {
  const openSingleQuote = exp.indexOf("'");
  const openDoubleQuote = exp.indexOf('"');

  if (openSingleQuote >= 0 && openSingleQuote < index) {
    return exp.indexOf("'", openSingleQuote + 1);
  } else if (openDoubleQuote >= 0 && openDoubleQuote < index) {
    return exp.indexOf('"', openDoubleQuote + 1);
  }

  return -1;
}

function getCloseBracketIndex(exp: string, openBracketIndex: number): number {
  const j = exp.indexOf("}", openBracketIndex);
  if (j < 0) {
    throw new Error(`replaceVariable: Unmatched {.`);
  }
  return j;
}

const makeReservedWord = (str: string) => `$reearth_${str}_$`;
const RESERVED_WORDS: Record<string, string> = {
  "[": makeReservedWord("opened_square_bracket"),
  "]": makeReservedWord("closed_square_bracket"),
  "{": makeReservedWord("opened_curly_bracket"),
  "}": makeReservedWord("closed_curly_bracket"),
  "(": makeReservedWord("opened_parentheses"),
  ")": makeReservedWord("closed_parentheses"),
  "-": makeReservedWord("hyphen"),
};

const replaceReservedWord = (word: string) => {
  const wordFiltered = word.replace(/-/g, RESERVED_WORDS["-"]);
  if (!/(\]|\)|\})[^[.]+$/.test(wordFiltered)) {
    return wordFiltered;
  }
  return Object.entries(RESERVED_WORDS).reduce((res, [key, val]) => {
    return res.replaceAll(key, val);
  }, wordFiltered);
};

export const restoreReservedWord = (text: string) =>
  Object.entries(RESERVED_WORDS).reduce((res, [key, val]) => res.replaceAll(val, key), text);

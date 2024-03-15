import jsep from "jsep";

import { Feature } from "../../../types";

import { backslashRegex, backslashReplacement } from "./constants";
import { Node } from "./node";
import { createRuntimeAst } from "./runtime";
import { replaceVariables, VARIABLE_PREFIX } from "./variableReplacer";

export type JPLiteral = { literalName: string; literalValue: any };
export const EXPRESSION_CACHES = new Map<string, Node | Error>();
export const REPLACED_VARIABLES_CACHE = new Map<string, [string, JPLiteral[]]>();
const DEFINE_CACHE = new Map<string, string>();
const BACKSLASH_CACHE = new Map<string, string>();

export class Expression {
  private _expression: string;
  private _runtimeAst: Node | Error;
  private _feature?: Feature;

  constructor(expression: string, feature?: Feature, defines?: any) {
    this._expression = expression;
    this._feature = feature;
    let literalJP: JPLiteral[] = [];
    expression = replaceMemoized(expression, defines);

    const cachedReplacedVariables = REPLACED_VARIABLES_CACHE.get(expression);
    if (cachedReplacedVariables) {
      [expression, literalJP] = cachedReplacedVariables;
    } else {
      const originalExpression = expression;
      [expression, literalJP] = replaceVariables(
        removeBackslashesCache(expression),
        this._feature?.properties,
      );
      if (expression.includes(VARIABLE_PREFIX)) {
        REPLACED_VARIABLES_CACHE.set(originalExpression, [expression, literalJP]);
      }
    }

    const cachedAST = EXPRESSION_CACHES.get(expression);
    if (cachedAST) {
      this._runtimeAst = cachedAST;
    } else {
      if (literalJP.length !== 0) {
        for (const elem of literalJP) {
          jsep.addLiteral(elem.literalName, elem.literalValue);
        }
      }

      jsep.addBinaryOp("=~", 0);
      jsep.addBinaryOp("!~", 0);

      let ast;
      try {
        ast = jsep(expression);
      } catch (e) {
        throw new Error(`failed to generate ast: ${e}`);
      }

      this._runtimeAst = createRuntimeAst(this, ast);
      EXPRESSION_CACHES.set(expression, this._runtimeAst);
    }
  }

  evaluate() {
    const value = (this._runtimeAst as Node).evaluate(this._feature);
    return value;
  }
}

function replaceDefines(expression: string, defines: any): string {
  if (typeof defines === "undefined") {
    return expression;
  }

  const definesKey = JSON.stringify(Object.entries(defines).sort());
  const cacheKey = `${expression}|${definesKey}`;

  const cachedResult = DEFINE_CACHE.get(cacheKey);
  const definePlaceholderRegex = cachedResult
    ? undefined
    : new RegExp(`\\${Object.keys(defines).join("|")}`, "g");

  if (cachedResult) {
    return cachedResult;
  }

  const replacedExpression = definePlaceholderRegex
    ? expression.replace(definePlaceholderRegex, (_, key) =>
        typeof defines[key] !== "undefined" ? `(${defines[key]})` : "",
      )
    : expression;

  DEFINE_CACHE.set(cacheKey, replacedExpression);
  return replacedExpression;
}

function removeBackslashesCache(expression: string): string {
  const cachedResult = BACKSLASH_CACHE.get(expression);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = expression.replace(backslashRegex, backslashReplacement);
  BACKSLASH_CACHE.set(expression, result);
  return result;
}

function replaceMemoized(expression: string, defines: any): string {
  return DEFINE_CACHE.has(expression)
    ? DEFINE_CACHE.get(expression)!
    : replaceDefines(expression, defines);
}

export function clearExpressionCaches(
  expression: string,
  feature: Feature | undefined,
  defines: any | undefined,
) {
  REPLACED_VARIABLES_CACHE.delete(expression);
  expression = replaceMemoized(expression, defines);
  [expression] = replaceVariables(removeBackslashesCache(expression), feature?.properties);
  EXPRESSION_CACHES.delete(expression);
}

import jsep from "jsep";

import { Feature } from "../../../types";

import { backslashRegex, backslashReplacement } from "./constants";
import { Node } from "./node";
import { createRuntimeAst } from "./runtime";
import { replaceVariables, VARIABLE_PREFIX } from "./variableReplacer";

export type JPLiteral = {
  literalName: string;
  literalValue: any;
};

export const EXPRESSION_CACHES = new Map<string, Node | Error>();
export const REPLACED_VARIABLES_CACHE = new Map<string, [string, JPLiteral[]]>();
const DEFINE_PLACEHOLDER_REGEX_CACHE = new Map<string, RegExp>();

export class Expression {
  private _expression: string;
  private _runtimeAst: Node | Error;
  private _feature?: Feature;

  constructor(expression: string, feature?: Feature, defines?: any) {
    this._expression = expression;
    this._feature = feature;
    let literalJP: JPLiteral[] = [];

    const cachedReplacedVariables = REPLACED_VARIABLES_CACHE.get(expression);
    // JSONPath returns simple literal so we can not cache in here
    if (cachedReplacedVariables) {
      [expression, literalJP] = cachedReplacedVariables;
    } else {
      const originalExpression = expression;
      expression = replaceDefines(expression, defines);
      [expression, literalJP] = replaceVariables(
        removeBackslashes(expression),
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

      // customize jsep operators
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

export function replaceDefines(expression: string, defines: any): string {
  if (typeof defines === "undefined") {
    return expression;
  }
  let definePlaceholderRegex = DEFINE_PLACEHOLDER_REGEX_CACHE.get(expression);
  if (!definePlaceholderRegex) {
    definePlaceholderRegex = new RegExp(`\\$\\{(${Object.keys(defines).join("|")})\\}`, "g");
    DEFINE_PLACEHOLDER_REGEX_CACHE.set(expression, definePlaceholderRegex);
  }
  return expression.replace(definePlaceholderRegex, (_, key) =>
    typeof defines[key] !== "undefined" ? `(${defines[key]})` : "",
  );
}

export function removeBackslashes(expression: string): string {
  return expression.replace(backslashRegex, backslashReplacement);
}

export function clearExpressionCaches(
  expression: string,
  feature: Feature | undefined,
  defines: any | undefined,
) {
  REPLACED_VARIABLES_CACHE.delete(expression);

  expression = replaceDefines(expression, defines);
  [expression] = replaceVariables(removeBackslashes(expression), feature?.properties);
  EXPRESSION_CACHES.delete(expression);
}

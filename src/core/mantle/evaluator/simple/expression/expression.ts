import jsep from "jsep";

import { Feature } from "../../../types";
import { defined } from "../../../utils";

import { backslashRegex, backslashReplacement } from "./constants";
import { Node } from "./node";
import { createRuntimeAst } from "./runtime";
import { replaceVariables } from "./variableReplacer";

export type JPLiteral = {
  literalName: string;
  literalValue: any;
};

export const EXPRESSION_CACHES = new Map<string, Node | Error>();

export class Expression {
  private _expression: string;
  private _runtimeAst: Node | Error;
  private _feature?: Feature;

  constructor(expression: string, feature?: Feature, defines?: any) {
    this._expression = expression;
    this._feature = feature;
    let literalJP: JPLiteral[] = [];
    expression = replaceDefines(expression, defines);
    [expression, literalJP] = replaceVariables(
      removeBackslashes(expression),
      this._feature?.properties,
    );

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
  if (!defined(defines)) {
    return expression;
  }
  for (const key in defines) {
    const definePlaceholder = new RegExp(`\\$\\{${key}\\}`, "g");
    const defineReplace = `(${defines[key]})`;
    if (defined(defineReplace)) {
      expression = expression.replace(definePlaceholder, defineReplace);
    }
  }
  return expression;
}

export function removeBackslashes(expression: string): string {
  return expression.replace(backslashRegex, backslashReplacement);
}

export function clearExpressionCaches(
  expression: string,
  feature: Feature | undefined,
  defines: any | undefined,
) {
  expression = replaceDefines(expression, defines);
  [expression] = replaceVariables(removeBackslashes(expression), feature?.properties);
  EXPRESSION_CACHES.delete(expression);
}

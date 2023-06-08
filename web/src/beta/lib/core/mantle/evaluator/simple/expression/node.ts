import { Feature } from "../../../types";

import { ExpressionNodeType } from "./constants";
import {
  getEvaluateUnaryFunction,
  unaryFunctions,
  getEvaluateBinaryFunction,
  binaryFunctions,
  Color,
} from "./functions";

export class Node {
  private _type;
  private _value;
  private _left;
  private _right;
  private _test;
  evaluate: any;

  constructor(type: any, value: any, left?: any, right?: any, test?: any) {
    this._type = type;
    this._value = value;
    this._left = left;
    this._right = right;
    this._test = test;

    this.setEvaluateFunction();
  }

  setEvaluateFunction() {
    const type = this._type;
    const value = this._value;

    switch (type) {
      case ExpressionNodeType.CONDITIONAL:
        this.evaluate = this._evaluateConditional;
        break;

      case ExpressionNodeType.FUNCTION_CALL:
        switch (value) {
          case "toString":
            this.evaluate = this._evaluateToString;
            break;
        }
        break;

      case ExpressionNodeType.UNARY:
        switch (value) {
          case "!":
            this.evaluate = this._evaluateNot;
            break;
          case "-":
            this.evaluate = this._evaluateNegative;
            break;
          case "+":
            this.evaluate = this._evaluatePositive;
            break;
          case "isNaN":
            this.evaluate = this._evaluateNaN;
            break;
          case "isFinite":
            this.evaluate = this._evaluateIsFinite;
            break;
          case "Boolean":
            this.evaluate = this._evaluateBooleanConversion;
            break;
          case "Number":
            this.evaluate = this._evaluateNumberConversion;
            break;
          case "String":
            this.evaluate = this._evaluateStringConversion;
            break;
          default:
            if (typeof unaryFunctions[value as string] !== "undefined") {
              this.evaluate = getEvaluateUnaryFunction(value);
            }
            break;
        }
        break;

      case ExpressionNodeType.BINARY:
        switch (value) {
          case "+":
            this.evaluate = this._evaluatePlus;
            break;
          case "-":
            this.evaluate = this._evaluateMinus;
            break;
          case "*":
            this.evaluate = this._evaluateTimes;
            break;
          case "/":
            this.evaluate = this._evaluateDivide;
            break;
          case "%":
            this.evaluate = this._evaluateMod;
            break;
          case "===":
            this.evaluate = this._evaluateEqualsStrict;
            break;
          case "!==":
            this.evaluate = this._evaluateNotEqualsStrict;
            break;
          case "<":
            this.evaluate = this._evaluateLessThan;
            break;
          case "<=":
            this.evaluate = this._evaluateLessThanOrEquals;
            break;
          case ">":
            this.evaluate = this._evaluateGreaterThan;
            break;
          case ">=":
            this.evaluate = this._evaluateGreaterThanOrEquals;
            break;
          case "&&":
            this.evaluate = this._evaluateAnd;
            break;
          case "||":
            this.evaluate = this._evaluateOr;
            break;
          default:
            if (typeof binaryFunctions[value] !== "undefined") {
              this.evaluate = getEvaluateBinaryFunction(value);
            }
            break;
        }
        break;

      case ExpressionNodeType.MEMBER:
        if (value === "brackets") {
          this.evaluate = this._evaluateMemberBrackets;
        } else {
          this.evaluate = this._evaluateMemberDot;
        }
        break;

      case ExpressionNodeType.ARRAY:
        this.evaluate = this._evaluateArray;
        break;

      case ExpressionNodeType.VARIABLE:
        this.evaluate = this._evaluateVariable;
        break;

      case ExpressionNodeType.VARIABLE_IN_STRING:
        this.evaluate = this._evaluateVariableString;
        break;

      case ExpressionNodeType.LITERAL_COLOR:
        this.evaluate = this._evaluateLiteralColor;
        break;

      case ExpressionNodeType.LITERAL_STRING:
        this.evaluate = this._evaluateLiteralString;
        break;

      default:
        this.evaluate = this._evaluateLiteral;
        break;
    }
  }

  _evaluateLiteral() {
    return this._value;
  }
  _evaluateLiteralString() {
    return this._value;
  }
  _evaluateVariableString(feature?: Feature) {
    const variableRegex = /\${(.*?)}/g;
    let result = this._value;
    let match = variableRegex.exec(result);
    while (match !== null) {
      const placeholder = match[0];
      const variableName = match[1];
      let property = feature?.properties[variableName];
      if (typeof property === "undefined") {
        property = "";
      }
      result = result.replace(placeholder, property);
      match = variableRegex.exec(result);
    }
    return result;
  }
  _evaluateVariable(feature?: Feature) {
    let property;
    if (feature && String(this._value) in feature.properties) {
      property = feature.properties[String(this._value)];
    } else if (String(this._value) === "id") {
      property = feature?.id;
    }
    if (typeof property === "undefined") {
      property = "";
    }
    return property;
  }
  _evaluateMemberDot(feature?: Feature) {
    if (checkFeature(this._left)) {
      return feature?.properties[this._right.evaluate(feature)];
    }
    const property = this._left.evaluate(feature);
    if (typeof property === "undefined") {
      return undefined;
    }

    const member = this._right.evaluate(feature);
    return property[member];
  }

  _evaluateMemberBrackets(feature?: Feature) {
    if (checkFeature(this._left)) {
      return feature?.properties[this._right.evaluate(feature)];
    }
    const property = this._left.evaluate(feature);
    if (typeof property === "undefined") {
      return undefined;
    }

    const member = this._right.evaluate(feature);
    return property[member];
  }
  _evaluateArray(feature?: Feature) {
    const array = [];
    for (let i = 0; i < this._value.length; i++) {
      array[i] = this._value[i].evaluate(feature);
    }
    return array;
  }

  _evaluateNot(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "!" requires a boolean argument. Argument is ${left}.`);
    }
    return !left;
  }
  _evaluateNegative(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left === "number") {
      return -left;
    }

    throw new Error(`Operator "-" requires a vector or number argument. Argument is ${left}.`);
  }
  _evaluatePositive(feature?: Feature) {
    const left = this._left.evaluate(feature);

    if (!(typeof left === "number")) {
      throw new Error(`Operator "+" requires a vector or number argument. Argument is ${left}.`);
    }

    return left;
  }
  _evaluateLessThan(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      console.warn(`Operator "<" requires number arguments. Arguments are ${left} and ${right}.`);
      return false;
    }

    return left < right;
  }
  _evaluateLessThanOrEquals(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      console.warn(`Operator "<=" requires number arguments. Arguments are ${left} and ${right}.`);
      return false;
    }

    return left <= right;
  }
  _evaluateGreaterThan(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      console.warn(`Operator ">" requires number arguments. Arguments are ${left} and ${right}.`);
      return false;
    }

    return left > right;
  }
  _evaluateGreaterThanOrEquals(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      console.warn(`Operator ">=" requires number arguments. Arguments are ${left} and ${right}.`);
      return false;
    }

    return left >= right;
  }
  _evaluateOr(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      console.warn(`Operator "||" requires boolean arguments. First argument is ${left}.`);
      return false;
    }

    // short circuit the expression
    if (left) {
      return true;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      console.warn(`Operator "||" requires boolean arguments. Second argument is ${right}.`);
      return false;
    }

    return left || right;
  }
  _evaluateAnd(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      console.warn(`Operator "&&" requires boolean arguments. First argument is ${left}.`);
      return false;
    }

    // short circuit the expression
    if (!left) {
      return false;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      console.warn(`Operator "&&" requires boolean arguments. Second argument is ${right}.`);
      return false;
    }

    return left && right;
  }
  _evaluatePlus(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left + right;
    }

    throw new Error(
      `Operator "+" requires vector or number arguments of matching types, or at least one string argument. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateMinus(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }

    throw new Error(
      `Operator "-" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateTimes(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left * right;
    }

    throw new Error(
      `Operator "*" requires vector or number arguments. If both arguments are vectors they must be matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateDivide(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left / right;
    }

    throw new Error(
      `Operator "/" requires vector or number arguments of matching types, or a number as the second argument. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateMod(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left % right;
    }

    throw new Error(
      `Operator "%" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateEqualsStrict(feature?: Feature): boolean {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    return left === right;
  }
  _evaluateNotEqualsStrict(feature?: Feature): boolean {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    return left !== right;
  }
  _evaluateConditional(feature?: Feature) {
    const test = this._test.evaluate(feature);

    if (typeof test !== "boolean") {
      throw new Error(
        `Conditional argument of conditional expression must be a boolean. Argument is ${test}.`,
      );
    }

    if (test) {
      return this._left.evaluate(feature);
    }
    return this._right.evaluate(feature);
  }
  _evaluateNaN(feature?: Feature): boolean {
    return isNaN(this._left.evaluate(feature));
  }
  _evaluateIsFinite(feature?: Feature): boolean {
    return isFinite(this._left.evaluate(feature));
  }

  _evaluateBooleanConversion(feature?: Feature): boolean {
    return Boolean(this._left.evaluate(feature));
  }
  _evaluateNumberConversion(feature?: Feature): number {
    const cleanedNumberInput = cleanseNumberStringInput(this._left.evaluate(feature));
    return Number(cleanedNumberInput);
  }
  _evaluateStringConversion(feature?: Feature): string {
    return String(this._left.evaluate(feature));
  }
  _evaluateToString(feature?: Feature): string | Error {
    const left = this._left.evaluate(feature);
    if (left instanceof RegExp) {
      return String(left);
    }
    throw new Error(`Unexpected function call "${this._value}".`);
  }

  _evaluateLiteralColor(feature?: Feature) {
    const args = this._left;
    let color = new Color();
    if (this._value === "color") {
      if (typeof args === "undefined") {
        color = Color.fromBytes(255, 255, 255, 255);
      } else if (args.length > 1) {
        const temp = Color.fromCssColorString(args[0].evaluate(feature));
        if (temp) {
          color = temp;
        } else {
          throw new Error(`wrong literalColor call "${this._value}, ${args}}"`);
        }
        color.alpha = args[1].evaluate(feature);
      } else {
        const temp = Color.fromCssColorString(args[0].evaluate(feature));
        if (temp) {
          color = temp;
        } else {
          throw new Error(`wrong literalColor call "${this._value}, ${args}}"`);
        }
      }
    } else if (this._value === "rgb") {
      color = Color.fromBytes(
        args[0].evaluate(feature),
        args[1].evaluate(feature),
        args[2].evaluate(feature),
        255,
      );
    } else if (this._value === "rgba") {
      // convert between css alpha (0 to 1) and cesium alpha (0 to 255)
      const a = args[3].evaluate(feature) * 255;
      color = Color.fromBytes(
        args[0].evaluate(feature),
        args[1].evaluate(feature),
        args[2].evaluate(feature),
        a,
      );
    } else if (this._value === "hsl") {
      const hsl = Color.fromHsl(
        args[0].evaluate(feature),
        args[1].evaluate(feature),
        args[2].evaluate(feature),
        1.0,
      );
      if (hsl) color = hsl;
    } else if (this._value === "hsla") {
      const hsl = Color.fromHsl(
        args[0].evaluate(feature),
        args[1].evaluate(feature),
        args[2].evaluate(feature),
        args[3].evaluate(feature),
      );
      if (hsl) color = hsl;
    }
    return color.toCssHexString();
  }
}

function cleanseNumberStringInput(input: any): any {
  if (typeof input !== "string") return input;

  const reservedWords = ["%"]; // add more reserved words if needed

  for (const word of reservedWords) {
    if (input.endsWith(word)) {
      return input.slice(0, -word.length).trim();
    }
  }

  return input.trim();
}

function checkFeature(ast: any): boolean {
  return ast._value === "feature";
}

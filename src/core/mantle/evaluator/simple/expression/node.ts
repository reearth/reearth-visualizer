import { Feature } from "../../../types";
import { defined } from "../../../utils";

import { ExpressionNodeType, variableRegex } from "./constants";
import {
  getEvaluateUnaryFunction,
  unaryFunctions,
  getEvaluateBinaryFunction,
  binaryFunctions,
  Color,
} from "./functions";

export class Node {
  _type;
  _value;
  _left;
  _right;
  _test;
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
    if (this._type === ExpressionNodeType.CONDITIONAL) {
      this.evaluate = this._evaluateConditional;
    } else if (this._type === ExpressionNodeType.FUNCTION_CALL) {
      if (this._value === "toString") {
        this.evaluate = this._evaluateToString;
      }
    } else if (this._type === ExpressionNodeType.UNARY) {
      if (this._value === "!") {
        this.evaluate = this._evaluateNot;
      } else if (this._value === "-") {
        this.evaluate = this._evaluateNegative;
      } else if (this._value === "+") {
        this.evaluate = this._evaluatePositive;
      } else if (this._value === "isNaN") {
        this.evaluate = this._evaluateNaN;
      } else if (this._value === "isFinite") {
        this.evaluate = this._evaluateIsFinite;
      } else if (this._value === "Boolean") {
        this.evaluate = this._evaluateBooleanConversion;
      } else if (this._value === "Number") {
        this.evaluate = this._evaluateNumberConversion;
      } else if (this._value === "String") {
        this.evaluate = this._evaluateStringConversion;
      } else if (defined(unaryFunctions[this._value as string])) {
        this.evaluate = getEvaluateUnaryFunction(this._value);
      }
    } else if (this._type === ExpressionNodeType.BINARY) {
      if (this._value === "+") {
        this.evaluate = this._evaluatePlus;
      } else if (this._value === "-") {
        this.evaluate = this._evaluateMinus;
      } else if (this._value === "*") {
        this.evaluate = this._evaluateTimes;
      } else if (this._value === "/") {
        this.evaluate = this._evaluateDivide;
      } else if (this._value === "%") {
        this.evaluate = this._evaluateMod;
      } else if (this._value === "===") {
        this.evaluate = this._evaluateEqualsStrict;
      } else if (this._value === "!==") {
        this.evaluate = this._evaluateNotEqualsStrict;
      } else if (this._value === "<") {
        this.evaluate = this._evaluateLessThan;
      } else if (this._value === "<=") {
        this.evaluate = this._evaluateLessThanOrEquals;
      } else if (this._value === ">") {
        this.evaluate = this._evaluateGreaterThan;
      } else if (this._value === ">=") {
        this.evaluate = this._evaluateGreaterThanOrEquals;
      } else if (this._value === "&&") {
        this.evaluate = this._evaluateAnd;
      } else if (this._value === "||") {
        this.evaluate = this._evaluateOr;
      } else if (defined(binaryFunctions[this._value])) {
        this.evaluate = getEvaluateBinaryFunction(this._value);
      }
    } else if (this._type === ExpressionNodeType.MEMBER) {
      if (this._value === "brackets") {
        this.evaluate = this._evaluateMemberBrackets;
      } else {
        this.evaluate = this._evaluateMemberDot;
      }
    } else if (this._type === ExpressionNodeType.ARRAY) {
      this.evaluate = this._evaluateArray;
    } else if (this._type === ExpressionNodeType.VARIABLE) {
      this.evaluate = this._evaluateVariable;
    } else if (this._type === ExpressionNodeType.VARIABLE_IN_STRING) {
      this.evaluate = this._evaluateVariableString;
    } else if (this._type === ExpressionNodeType.LITERAL_COLOR) {
      this.evaluate = this._evaluateLiteralColor;
    } else if (this._type === ExpressionNodeType.LITERAL_STRING) {
      this.evaluate = this._evaluateLiteralString;
    } else {
      this.evaluate = this._evaluateLiteral;
    }
  }

  _evaluateLiteral() {
    return this._value;
  }
  _evaluateLiteralString() {
    return this._value;
  }
  _evaluateVariableString(feature?: Feature) {
    let result = this._value;
    let match = variableRegex.exec(result);
    while (match !== null) {
      const placeholder = match[0];
      const variableName = match[1];
      let property = feature?.properties[variableName];
      if (!defined(property)) {
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
    if (!defined(property)) {
      property = "";
    }
    return property;
  }
  _evaluateMemberDot(feature?: Feature) {
    if (checkFeature(this._left)) {
      return feature?.properties[this._right.evaluate(feature)];
    }
    const property = this._left.evaluate(feature);
    if (!defined(property)) {
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
    if (!defined(property)) {
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
      throw new Error(
        `Operator "<" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left < right;
  }
  _evaluateLessThanOrEquals(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator "<=" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left <= right;
  }
  _evaluateGreaterThan(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator ">" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left > right;
  }
  _evaluateGreaterThanOrEquals(feature?: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator ">=" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left >= right;
  }
  _evaluateOr(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "||" requires boolean arguments. First argument is ${left}.`);
    }

    // short circuit the expression
    if (left) {
      return true;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      throw new Error(`Operator "||" requires boolean arguments. Second argument is ${right}.`);
    }

    return left || right;
  }
  _evaluateAnd(feature?: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "&&" requires boolean arguments. First argument is ${left}.`);
    }

    // short circuit the expression
    if (!left) {
      return false;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      throw new Error(`Operator "&&" requires boolean arguments. Second argument is ${right}.`);
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
    return Number(this._left.evaluate(feature));
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
      if (!defined(args)) {
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

function checkFeature(ast: any): boolean {
  return ast._value === "feature";
}

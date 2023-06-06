import { Math as CesiumMath } from "cesium";

type UnaryFunction = (call: string, left: number) => number;

export function getEvaluateUnaryFunction(call: string): (feature: any) => number {
  const evaluate = unaryFunctions[call];
  return function (this: { _left: any }, feature: any): number {
    const left = this._left.evaluate(feature);
    return evaluate(call, left);
  };
}

export const unaryFunctions: { [key: string]: UnaryFunction } = {
  abs: getEvaluateUnaryComponentwise(Math.abs),
  sqrt: getEvaluateUnaryComponentwise(Math.sqrt),
  cos: getEvaluateUnaryComponentwise(Math.cos),
  sin: getEvaluateUnaryComponentwise(Math.sin),
  tan: getEvaluateUnaryComponentwise(Math.tan),
  acos: getEvaluateUnaryComponentwise(Math.acos),
  asin: getEvaluateUnaryComponentwise(Math.asin),
  atan: getEvaluateUnaryComponentwise(Math.atan),
  radians: getEvaluateUnaryComponentwise(CesiumMath.toRadians),
  degrees: getEvaluateUnaryComponentwise(CesiumMath.toDegrees),
  sign: getEvaluateUnaryComponentwise(CesiumMath.sign),
  floor: getEvaluateUnaryComponentwise(Math.floor),
  ceil: getEvaluateUnaryComponentwise(Math.ceil),
  round: getEvaluateUnaryComponentwise(Math.round),
  exp2: getEvaluateUnaryComponentwise(exp2),
  log: getEvaluateUnaryComponentwise(Math.log),
  log2: getEvaluateUnaryComponentwise(log2),
  fract: getEvaluateUnaryComponentwise(fract),
};
function getEvaluateUnaryComponentwise(operation: (value: number) => number): UnaryFunction {
  return function (call: any, left: any) {
    if (typeof left === "number") {
      return operation(left);
    }
    throw new Error(
      `Function "${call}" requires a vector or number argument. Argument is ${left}.`,
    );
  };
}

function fract(number: number): number {
  return number - Math.floor(number);
}

function exp2(exponent: number): number {
  return Math.pow(2.0, exponent);
}

function log2(number: number): number {
  return CesiumMath.log2(number);
}

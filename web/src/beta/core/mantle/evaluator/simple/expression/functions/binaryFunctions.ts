type BinaryFunction = (call: string, left: number, right: number) => number;

export function getEvaluateBinaryFunction(call: string): (feature: any) => number {
  const evaluate = binaryFunctions[call];
  return function (this: { _left: any; _right: any }, feature: any): number {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    return evaluate(call, left, right);
  };
}

export const binaryFunctions: { [key: string]: BinaryFunction } = {
  atan2: getEvaluateBinaryComponentwise(Math.atan2, false),
  pow: getEvaluateBinaryComponentwise(Math.pow, false),
  min: getEvaluateBinaryComponentwise(Math.min, true),
  max: getEvaluateBinaryComponentwise(Math.max, true),
};

function getEvaluateBinaryComponentwise(operation: any, allowScalar: boolean): BinaryFunction {
  return function (call: any, left: any, right: any) {
    if (allowScalar && typeof right === "number") {
      if (typeof left === "number") {
        return operation(left, right);
      }
    }
    if (typeof left === "number" && typeof right === "number") {
      return operation(left, right);
    }

    throw new Error(
      `Function "${call}" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  };
}

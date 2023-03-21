import { Feature, ConditionsExpression } from "../../../types";
import { Expression } from "../expression";

export class ConditionalExpression {
  private _conditions: [string, string][];
  private _runtimeConditions: Statement[];
  private _feature?: Feature;
  private _memoizedResult: any;

  constructor(conditionsExpression: ConditionsExpression, feature?: Feature, defines?: any) {
    this._conditions = conditionsExpression.conditions;
    this._runtimeConditions = [];
    this._feature = feature;
    this._memoizedResult = undefined;

    this.setRuntime(defines);
  }

  setRuntime(defines: any) {
    const runtimeConditions = this._conditions?.map(statement => {
      const cond = String(statement[0]);
      const condExpression = String(statement[1]);
      return new Statement(
        new Expression(cond, this._feature, defines),
        new Expression(condExpression, this._feature, defines),
      );
    });
    this._runtimeConditions = runtimeConditions ?? [];
    this._memoizedResult = undefined;
  }

  evaluate() {
    if (typeof this._memoizedResult !== "undefined") {
      return this._memoizedResult;
    }

    const conditions = this._runtimeConditions;
    const length = conditions.length;
    for (let i = 0; i < length; i++) {
      const statement = conditions[i];
      if (statement.condition.evaluate()) {
        const result = statement.expression.evaluate();
        this._memoizedResult = result;
        return result;
      }
    }
    const undefinedResult = undefined;
    this._memoizedResult = undefinedResult;
    return undefinedResult;
  }
}

class Statement {
  condition: Expression;
  expression: Expression;
  constructor(condition: Expression, expression: Expression) {
    this.condition = condition;
    this.expression = expression;
  }
}

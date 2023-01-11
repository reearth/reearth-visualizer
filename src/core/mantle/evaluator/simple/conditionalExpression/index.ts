import { Feature, ConditionsExpression } from "../../../types";
import { defined } from "../../../utils";
import { Expression } from "../expression";

export class ConditionalExpression {
  #conditions: [string, string][];
  #runtimeConditions: Statement[];
  #feature?: Feature;

  constructor(conditionsExpression: ConditionsExpression, feature?: Feature, defines?: any) {
    this.#conditions = conditionsExpression.conditions;
    this.#runtimeConditions = [];
    this.#feature = feature;

    this.setRuntime(defines);
  }

  setRuntime(defines: any) {
    const runtimeConditions = [];
    const conditions = this.#conditions;
    if (!defined(conditions)) {
      return;
    }
    const length = conditions.length;
    for (let i = 0; i < length; i++) {
      const statement = conditions[i];
      const cond = String(statement[0]);
      const condExpression = String(statement[1]);
      runtimeConditions.push(
        new Statement(
          new Expression(cond, this.#feature, defines),
          new Expression(condExpression, this.#feature, defines),
        ),
      );
    }
    this.#runtimeConditions = runtimeConditions;
  }

  evaluate() {
    const conditions = this.#runtimeConditions;
    if (defined(conditions)) {
      const length = conditions.length;
      for (let i = 0; i < length; ++i) {
        const statement = conditions[i];
        if (statement.condition.evaluate()) {
          return statement.expression.evaluate();
        }
      }
    }
    return undefined;
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

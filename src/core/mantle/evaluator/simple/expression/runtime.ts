import { defined } from "../../../utils";

import { ExpressionNodeType, unaryOperators, binaryOperators, replacementRegex } from "./constants";
import { Expression } from "./expression";
import { unaryFunctions, binaryFunctions } from "./functions";
import { Node } from "./node";

export function createRuntimeAst(expression: Expression, ast: any): Node | Error {
  let node: Node | Error = new Error("failed to parse");
  let op;
  let left;
  let right;

  if (ast.type === "Literal") {
    node = parseLiteral(ast);
  } else if (ast.type === "CallExpression") {
    node = parseCall(expression, ast);
  } else if (ast.type === "Identifier") {
    node = parseKeywordsAndVariables(ast);
  } else if (ast.type === "UnaryExpression") {
    op = ast.operator;
    const child = createRuntimeAst(expression, ast.argument);
    if (unaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.UNARY, op, child);
    } else {
      throw new Error(`Unexpected operator "${op}".`);
    }
  } else if (ast.type === "BinaryExpression") {
    op = ast.operator;
    left = createRuntimeAst(expression, ast.left);
    right = createRuntimeAst(expression, ast.right);
    if (binaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.BINARY, op, left, right);
    } else {
      throw new Error(`Unexpected operator "${op}".`);
    }
  } else if (ast.type === "LogicalExpression") {
    op = ast.operator;
    left = createRuntimeAst(expression, ast.left);
    right = createRuntimeAst(expression, ast.right);
    if (binaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.BINARY, op, left, right);
    }
  } else if (ast.type === "ConditionalExpression") {
    const test = createRuntimeAst(expression, ast.test);
    left = createRuntimeAst(expression, ast.consequent);
    right = createRuntimeAst(expression, ast.alternate);
    node = new Node(ExpressionNodeType.CONDITIONAL, "?", left, right, test);
  } else if (ast.type === "MemberExpression") {
    node = parseMemberExpression(expression, ast);
  } else if (ast.type === "ArrayExpression") {
    const val = [];
    for (let i = 0; i < ast.elements.length; i++) {
      val[i] = createRuntimeAst(expression, ast.elements[i]);
    }
    node = new Node(ExpressionNodeType.ARRAY, val);
  } else if (ast.type === "Compound") {
    // empty expression or multiple expressions
    throw new Error("Provide exactly one expression.");
  } else {
    throw new Error("Cannot parse expression.");
  }

  return node;
}

function parseLiteral(ast: any): Node | Error {
  const type = typeof ast.value;
  if (ast.value === null) {
    return new Node(ExpressionNodeType.LITERAL_NULL, null);
  } else if (type === "boolean") {
    return new Node(ExpressionNodeType.LITERAL_BOOLEAN, ast.value);
  } else if (type === "number") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, ast.value);
  } else if (type === "string") {
    if (ast.value.indexOf("${") >= 0) {
      return new Node(ExpressionNodeType.VARIABLE_IN_STRING, ast.value);
    }
    // } else if (rgbaMatcher.exec(ast.value) || rrggbbaaMatcher.exec(ast.value)) {
    //   const val = new Node(ExpressionNodeType.LITERAL_STRING, replaceBackslashes(ast.value));
    //   return new Node(ExpressionNodeType.LITERAL_COLOR, "color", [val]);
    // }
    return new Node(ExpressionNodeType.LITERAL_STRING, replaceBackslashes(ast.value));
  }

  throw new Error(`${ast} is not a function.`);
}

export function replaceBackslashes(expression: string): string {
  return expression.replace(replacementRegex, "\\");
}

function parseCall(expression: Expression, ast: any): Node | Error {
  const args = ast.arguments;
  const argsLength = args.length;
  let call;
  let val, left, right;

  // Member function calls
  if (ast.callee.type === "MemberExpression") {
    call = ast.callee.property.name;
    const object = ast.callee.object;
    if (call === "test" || call === "exec") {
      // Make sure this is called on a valid type
      if (object.callee.name !== "regExp") {
        throw new Error(`${call} is not a function.`);
      }
      if (argsLength === 0) {
        if (call === "test") {
          return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
        }
        return new Node(ExpressionNodeType.LITERAL_NULL, null);
      }
      left = createRuntimeAst(expression, object);
      right = createRuntimeAst(expression, args[0]);
      return new Node(ExpressionNodeType.FUNCTION_CALL, call, left, right);
    } else if (call === "toString") {
      val = createRuntimeAst(expression, object);
      return new Node(ExpressionNodeType.FUNCTION_CALL, call, val);
    }

    throw new Error(`Unexpected function call "${call}".`);
  }

  // Non-member function calls
  call = ast.callee.name;
  if (call === "color") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_COLOR, call);
    }
    val = createRuntimeAst(expression, args[0]);
    if (defined(args[1])) {
      const alpha = createRuntimeAst(expression, args[1]);
      return new Node(ExpressionNodeType.LITERAL_COLOR, call, [val, alpha]);
    }
    return new Node(ExpressionNodeType.LITERAL_COLOR, call, [val]);
  } else if (call === "rgb" || call === "hsl") {
    if (argsLength < 3) {
      throw new Error(`${call} requires three arguments.`);
    }
    val = [
      createRuntimeAst(expression, args[0]),
      createRuntimeAst(expression, args[1]),
      createRuntimeAst(expression, args[2]),
    ];
    return new Node(ExpressionNodeType.LITERAL_COLOR, call, val);
  } else if (call === "rgba" || call === "hsla") {
    if (argsLength < 4) {
      throw new Error(`${call} requires four arguments.`);
    }
    val = [
      createRuntimeAst(expression, args[0]),
      createRuntimeAst(expression, args[1]),
      createRuntimeAst(expression, args[2]),
      createRuntimeAst(expression, args[3]),
    ];
    return new Node(ExpressionNodeType.LITERAL_COLOR, call, val);
  } else if (call === "isNaN" || call === "isFinite") {
    if (argsLength === 0) {
      if (call === "isNaN") {
        return new Node(ExpressionNodeType.LITERAL_BOOLEAN, true);
      }
      return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (defined(unaryFunctions[call])) {
    if (argsLength !== 1) {
      throw new Error(`${call} requires exactly one argument.`);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (defined(binaryFunctions[call])) {
    if (argsLength !== 2) {
      throw new Error(`${call} requires exactly two arguments.`);
    }
    left = createRuntimeAst(expression, args[0]);
    right = createRuntimeAst(expression, args[1]);
    return new Node(ExpressionNodeType.BINARY, call, left, right);
  } else if (call === "Boolean") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (call === "Number") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_NUMBER, 0);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (call === "String") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_STRING, "");
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  }

  throw new Error(`Unexpected function call "${call}".`);
}

function parseKeywordsAndVariables(ast: any): Node | Error {
  if (isVariable(ast.name)) {
    const name = getPropertyName(ast.name);
    if (name.substring(0, 8) === "tiles3d_") {
      return new Node(ExpressionNodeType.BUILTIN_VARIABLE, name);
    }
    return new Node(ExpressionNodeType.VARIABLE, name);
  } else if (ast.name === "NaN") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, NaN);
  } else if (ast.name === "Infinity") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Infinity);
  } else if (ast.name === "undefined") {
    return new Node(ExpressionNodeType.LITERAL_UNDEFINED, undefined);
  }

  throw new Error(`${ast.name} is not defined.`);
}

function parseMathConstant(ast: any) {
  const name = ast.property.name;
  if (name === "PI") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Math.PI);
  } else if (name === "E") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Math.E);
  }

  throw new Error(`${name} Math Constant is not supported at the moment`);
}

function parseNumberConstant(ast: any) {
  const name = ast.property.name;
  if (name === "POSITIVE_INFINITY") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Number.POSITIVE_INFINITY);
  }
  throw new Error(`${name} Number Constant is not supported at the moment`);
}

function parseMemberExpression(expression: Expression, ast: any) {
  if (ast.object.name === "Math") {
    return parseMathConstant(ast);
  } else if (ast.object.name === "Number") {
    return parseNumberConstant(ast);
  }

  let val;
  const obj = createRuntimeAst(expression, ast.object);
  if (ast.computed) {
    val = createRuntimeAst(expression, ast.property);
    return new Node(ExpressionNodeType.MEMBER, "brackets", obj, val);
  }

  val = new Node(ExpressionNodeType.LITERAL_STRING, ast.property.name);
  return new Node(ExpressionNodeType.MEMBER, "dot", obj, val);
}

function isVariable(name: string): boolean {
  return name.substring(0, 4) === "czm_";
}

function getPropertyName(variable: string): string {
  return variable.substring(4);
}

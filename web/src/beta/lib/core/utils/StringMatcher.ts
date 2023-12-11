/**
 * Copied from: https://github.com/takram-design-engineering/plateau-view/blob/b7bba6de249d068e2e56b1601e0f6d86053b5d30/libs/cesium/src/StringMatcher.ts
 */
import escapeStringRegexp from "escape-string-regexp";

type Command = (source: string) => string;

export class StringMatcher {
  private readonly commands: Command[] = [];

  concat(...others: StringMatcher[]): StringMatcher {
    const result = new StringMatcher();
    result.commands.push(...this.commands);
    others.forEach(other => {
      result.commands.push(...other.commands);
    });
    return result;
  }

  static match(
    source: string,
    search: string | string[],
    multiple = false,
  ): Array<RegExpMatchArray & { index: number }> {
    const pattern = Array.isArray(search)
      ? new RegExp(search.map(string => escapeStringRegexp(string)).join("\\s*"), "g")
      : new RegExp(escapeStringRegexp(search), "g");

    const matches = [...source.matchAll(pattern)].filter(
      (match): match is RegExpMatchArray & { index: number } => match.index != null,
    );
    if (matches == null || matches.length === 0) {
      throw new Error(`No matching codes found for: "${search}"`);
    }
    if (!multiple && matches.length > 1) {
      throw new Error(`Multiple codes found for: "${search}"`);
    }
    return matches;
  }

  replace(search: string | string[], code: string, multiple = false): this {
    this.commands.push(source => {
      const matches = StringMatcher.match(source, search, multiple);
      const indices = [
        0,
        ...matches.flatMap(match => [match.index, match.index + match[0].length]),
        source.length,
      ];
      const chunks: string[] = [];
      indices.reduce((start, end, index) => {
        chunks.push(matches[(index - 2) / 2] != null ? code : source.slice(start, end));
        return end;
      }, 0);
      return chunks.join("");
    });
    return this;
  }

  insertBefore(search: string | string[], code: string, multiple?: boolean): this {
    this.commands.push(source => {
      const matches = StringMatcher.match(source, search, multiple);
      const indices = [
        0,
        ...matches.flatMap(match => [match.index, match.index + match[0].length]),
        source.length,
      ];
      const chunks: string[] = [];
      indices.reduce((start, end, index) => {
        const chunk = source.slice(start, end);
        chunks.push(matches[(index - 2) / 2] != null ? `${code}\n${chunk}` : chunk);
        return end;
      }, 0);
      return chunks.join("");
    });
    return this;
  }

  insertAfter(search: string | string[], code: string, multiple?: boolean): this {
    this.commands.push(source => {
      const matches = StringMatcher.match(source, search, multiple);
      const indices = [
        0,
        ...matches.flatMap(match => [match.index, match.index + match[0].length]),
        source.length,
      ];
      const chunks: string[] = [];
      indices.reduce((start, end, index) => {
        const chunk = source.slice(start, end);
        chunks.push(matches[(index - 2) / 2] != null ? `${chunk}\n${code}` : chunk);
        return end;
      }, 0);
      return chunks.join("");
    });
    return this;
  }

  erase(search: string | string[], multiple?: boolean): this {
    return this.replace(search, "", multiple);
  }

  execute(source: string): string {
    return this.commands.reduce((source, command) => command(source), source);
  }
}

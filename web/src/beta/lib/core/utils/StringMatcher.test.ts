/**
 * Copied from: https://github.com/takram-design-engineering/plateau-view/blob/b7bba6de249d068e2e56b1601e0f6d86053b5d30/libs/cesium/src/StringMatcher.test.ts
 */

import { describe, expect, test } from "vitest";

import { StringMatcher } from "./StringMatcher";

const source =
  "uniform sampler2D colorTexture;\n" +
  "uniform sampler2D depthTexture;\n" +
  "\n" +
  "void main() {\n" +
  "  vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
  "  out_FragColor = color;\n" +
  "}\n";

describe("StringMatcher", () => {
  describe("match", () => {
    test("match single code", () => {
      const result = StringMatcher.match(source, "void main()");
      expect(result.length).toBe(1);
      expect(result[0].index).toBe(65);
      expect(result[0][0]).toBe("void main()");
    });

    test("match multiple codes", () => {
      const result = StringMatcher.match(source, "uniform sampler2D", true);
      expect(result.length).toBe(2);
      expect(result[0].index).toBe(0);
      expect(result[0][0]).toBe("uniform sampler2D");
      expect(result[1].index).toBe(32);
      expect(result[1][0]).toBe("uniform sampler2D");
    });

    test("throw error when multiple codes found", () => {
      expect(() => {
        StringMatcher.match(source, "uniform sampler2D");
      }).toThrowError();
    });
  });

  describe("replace", () => {
    test("replace single line", () => {
      const injector = new StringMatcher();
      expect(
        injector
          .replace(
            "vec4 color = texture(colorTexture, v_textureCoordinates);",
            "vec4 color = texture(colorTexture, v_textureCoordinates * 0.5);",
          )
          .execute(source),
      ).toBe(
        "uniform sampler2D colorTexture;\n" +
          "uniform sampler2D depthTexture;\n" +
          "\n" +
          "void main() {\n" +
          "  vec4 color = texture(colorTexture, v_textureCoordinates * 0.5);\n" +
          "  out_FragColor = color;\n" +
          "}\n",
      );
      expect(
        injector
          .replace("uniform sampler2D colorTexture;", "uniform sampler2D colorTexture2;")
          .execute(source),
      ).toBe(
        "uniform sampler2D colorTexture2;\n" +
          "uniform sampler2D depthTexture;\n" +
          "\n" +
          "void main() {\n" +
          "  vec4 color = texture(colorTexture, v_textureCoordinates * 0.5);\n" +
          "  out_FragColor = color;\n" +
          "}\n",
      );
    });

    test("replace multiple lines", () => {
      const injector = new StringMatcher();
      expect(injector.replace("uniform sampler2D", "uniform vec4", true).execute(source)).toBe(
        "uniform vec4 colorTexture;\n" +
          "uniform vec4 depthTexture;\n" +
          "\n" +
          "void main() {\n" +
          "  vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
          "  out_FragColor = color;\n" +
          "}\n",
      );
    });
  });

  test("insertBefore", () => {
    const injector = new StringMatcher();
    expect(injector.insertBefore("void main()", "uniform vec2 uv;").execute(source)).toBe(
      "uniform sampler2D colorTexture;\n" +
        "uniform sampler2D depthTexture;\n" +
        "\n" +
        "uniform vec2 uv;\n" +
        "void main() {\n" +
        "  vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
        "  out_FragColor = color;\n" +
        "}\n",
    );
  });

  test("insertAfter", () => {
    const injector = new StringMatcher();
    expect(
      injector.insertAfter("uniform sampler2D depthTexture;", "uniform vec2 uv;").execute(source),
    ).toBe(
      "uniform sampler2D colorTexture;\n" +
        "uniform sampler2D depthTexture;\n" +
        "uniform vec2 uv;\n" +
        "\n" +
        "void main() {\n" +
        "  vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
        "  out_FragColor = color;\n" +
        "}\n",
    );
  });

  test("erase", () => {
    const injector = new StringMatcher();
    expect(injector.erase("uniform sampler2D depthTexture;\n").execute(source)).toBe(
      "uniform sampler2D colorTexture;\n" +
        "\n" +
        "void main() {\n" +
        "  vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
        "  out_FragColor = color;\n" +
        "}\n",
    );
  });
});

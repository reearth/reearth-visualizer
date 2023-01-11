import { defaultValue, defined } from "../../../../utils";
import { rgbaMatcher, rrggbbaaMatcher, builtInColor } from "../constants";

//rgb(), rgba(), or rgb%()
const rgbParenthesesMatcher =
  /^rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)(?:\s*,\s*([0-9.]+))?\s*\)$/i;
//hsl() or hsla()
const hslParenthesesMatcher =
  /^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+%)\s*,\s*([0-9.]+%)(?:\s*,\s*([0-9.]+))?\s*\)$/i;

export class Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  constructor(red?: number, green?: number, blue?: number, alpha?: number) {
    this.red = defaultValue(red, 1.0);
    this.green = defaultValue(green, 1.0);
    this.blue = defaultValue(blue, 1.0);
    this.alpha = defaultValue(alpha, 1.0);
  }

  static byteToFloat(number: number): number {
    return number / 255.0;
  }
  static floatToByte(number: number): number {
    return number === 1.0 ? 255.0 : (number * 256.0) | 0;
  }

  static fromCssColorString(color: string): Color | undefined {
    // Remove all whitespaces from the color string
    color = color.replace(/\s/g, "");

    const namedColor = getColor(color);
    if (defined(namedColor)) {
      return namedColor;
    }

    let matches = rgbaMatcher.exec(color);
    if (matches !== null) {
      const result = new Color();
      result.red = parseInt(matches[1], 16) / 15;
      result.green = parseInt(matches[2], 16) / 15.0;
      result.blue = parseInt(matches[3], 16) / 15.0;
      result.alpha = parseInt(defaultValue(matches[4], "f"), 16) / 15.0;
      return result;
    }

    matches = rrggbbaaMatcher.exec(color);
    if (matches !== null) {
      const result = new Color();
      result.red = parseInt(matches[1], 16) / 255.0;
      result.green = parseInt(matches[2], 16) / 255.0;
      result.blue = parseInt(matches[3], 16) / 255.0;
      result.alpha = parseInt(defaultValue(matches[4], "ff"), 16) / 255.0;
      return result;
    }

    matches = rgbParenthesesMatcher.exec(color);
    if (matches !== null) {
      const result = new Color();
      result.red = parseFloat(matches[1]) / ("%" === matches[1].substr(-1) ? 100.0 : 255.0);
      result.green = parseFloat(matches[2]) / ("%" === matches[2].substr(-1) ? 100.0 : 255.0);
      result.blue = parseFloat(matches[3]) / ("%" === matches[3].substr(-1) ? 100.0 : 255.0);
      result.alpha = parseFloat(defaultValue(matches[4], "1.0"));
      return result;
    }

    matches = hslParenthesesMatcher.exec(color);
    if (matches !== null) {
      return Color.fromHsl(
        parseFloat(matches[1]) / 360.0,
        parseFloat(matches[2]) / 100.0,
        parseFloat(matches[3]) / 100.0,
        parseFloat(defaultValue(matches[4], "1.0")),
      );
    }
    return undefined;
  }

  static fromHsl(
    hue?: number,
    saturation?: number,
    lightness?: number,
    alpha?: number,
  ): Color | undefined {
    hue = defaultValue(hue, 0.0) % 1.0;
    saturation = defaultValue(saturation, 0.0);
    lightness = defaultValue(lightness, 0.0);
    alpha = defaultValue(alpha, 1.0);

    if (hue && saturation && lightness && alpha) {
      let red = lightness;
      let green = lightness;
      let blue = lightness;
      const result = new Color();

      if (saturation !== 0) {
        let m2;
        if (lightness < 0.5) {
          m2 = lightness * (1 + saturation);
        } else {
          m2 = lightness + saturation - lightness * saturation;
        }

        const m1 = 2.0 * lightness - m2;
        red = hue2rgb(m1, m2, hue + 1 / 3);
        green = hue2rgb(m1, m2, hue);
        blue = hue2rgb(m1, m2, hue - 1 / 3);
      }

      if (!defined(result)) {
        return new Color(red, green, blue, alpha);
      }

      result.red = red;
      result.green = green;
      result.blue = blue;
      result.alpha = alpha;
      return result;
    }
    return undefined;
  }

  toCssHexString() {
    let r = Color.floatToByte(this.red).toString(16);
    if (r.length < 2) {
      r = `0${r}`;
    }
    let g = Color.floatToByte(this.green).toString(16);
    if (g.length < 2) {
      g = `0${g}`;
    }
    let b = Color.floatToByte(this.blue).toString(16);
    if (b.length < 2) {
      b = `0${b}`;
    }
    if (this.alpha < 1) {
      let hexAlpha = Color.floatToByte(this.alpha).toString(16);
      if (hexAlpha.length < 2) {
        hexAlpha = `0${hexAlpha}`;
      }
      return `#${r}${g}${b}${hexAlpha}`;
    }
    return `#${r}${g}${b}`.toUpperCase();
  }

  static fromBytes(red: number, green: number, blue: number, alpha: number) {
    red = this.byteToFloat(defaultValue(red, 255.0));
    green = Color.byteToFloat(defaultValue(green, 255.0));
    blue = Color.byteToFloat(defaultValue(blue, 255.0));
    alpha = Color.byteToFloat(defaultValue(alpha, 255.0));

    return new Color(red, green, blue, alpha);
  }
}

function getColor(color: string): Color | undefined {
  color = color.toUpperCase();
  if (builtInColor[color]) {
    return Color.fromCssColorString(builtInColor[color]);
  }

  switch (color) {
    case "TRANSPARENT":
      return new Color(0, 0, 0, 0);
    default:
      return undefined;
  }
}

function hue2rgb(m1: number, m2: number, h: number): number {
  if (h < 0) {
    h += 1;
  }
  if (h > 1) {
    h -= 1;
  }
  if (h * 6 < 1) {
    return m1 + (m2 - m1) * 6 * h;
  }
  if (h * 2 < 1) {
    return m2;
  }
  if (h * 3 < 2) {
    return m1 + (m2 - m1) * (2 / 3 - h) * 6;
  }
  return m1;
}

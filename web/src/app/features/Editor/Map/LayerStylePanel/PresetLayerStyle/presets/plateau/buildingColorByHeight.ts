import { PresetStyle } from "../types";

export const plateauBuildingColorByHeight: PresetStyle = {
  id: "plateauBuildingColorByHeight",
  title: "Building Color by Height",
  testId: "preset-style-plateau-building-color-by-height",
  style: {
    "3dtiles": {
      color: {
        expression: {
          conditions: [
            ["${bldg:measuredHeight}>=233", "color('#F8FA51')"],
            ["${bldg:measuredHeight}>=228", "color('#F8F658')"],
            ["${bldg:measuredHeight}>=223", "color('#F8F25E')"],
            ["${bldg:measuredHeight}>=218", "color('#F8EE65')"],
            ["${bldg:measuredHeight}>=213", "color('#F8EA6B')"],
            ["${bldg:measuredHeight}>=208", "color('#F7E670')"],
            ["${bldg:measuredHeight}>=203", "color('#F7E276')"],
            ["${bldg:measuredHeight}>=198", "color('#F6DE7B')"],
            ["${bldg:measuredHeight}>=193", "color('#F6DA80')"],
            ["${bldg:measuredHeight}>=188", "color('#F3D77E')"],
            ["${bldg:measuredHeight}>=183", "color('#EFD37D')"],
            ["${bldg:measuredHeight}>=178", "color('#ECD07B')"],
            ["${bldg:measuredHeight}>=173", "color('#E9CC79')"],
            ["${bldg:measuredHeight}>=168", "color('#E6CA77')"],
            ["${bldg:measuredHeight}>=163", "color('#E2C674')"],
            ["${bldg:measuredHeight}>=158", "color('#DEC371')"],
            ["${bldg:measuredHeight}>=153", "color('#DAC06D')"],
            ["${bldg:measuredHeight}>=148", "color('#D9BD70')"],
            ["${bldg:measuredHeight}>=143", "color('#D7B878')"],
            ["${bldg:measuredHeight}>=138", "color('#D5B47E')"],
            ["${bldg:measuredHeight}>=133", "color('#D4AF85')"],
            ["${bldg:measuredHeight}>=128", "color('#D4AB8E')"],
            ["${bldg:measuredHeight}>=123", "color('#D3A69B')"],
            ["${bldg:measuredHeight}>=118", "color('#D1A1A7')"],
            ["${bldg:measuredHeight}>=113", "color('#D19CB4')"],
            ["${bldg:measuredHeight}>=108", "color('#CF95C0')"],
            ["${bldg:measuredHeight}>=103", "color('#CB8FC7')"],
            ["${bldg:measuredHeight}>=98", "color('#C689CE')"],
            ["${bldg:measuredHeight}>=93", "color('#C283D6')"],
            ["${bldg:measuredHeight}>=88", "color('#BE7CDD')"],
            ["${bldg:measuredHeight}>=83", "color('#B673DE')"],
            ["${bldg:measuredHeight}>=78", "color('#AE6CDF')"],
            ["${bldg:measuredHeight}>=73", "color('#A665DF')"],
            ["${bldg:measuredHeight}>=68", "color('#9F5CDF')"],
            ["${bldg:measuredHeight}>=63", "color('#9755DD')"],
            ["${bldg:measuredHeight}>=58", "color('#8F4EDD')"],
            ["${bldg:measuredHeight}>=53", "color('#8648D8')"],
            ["${bldg:measuredHeight}>=48", "color('#7E41D5')"],
            ["${bldg:measuredHeight}>=43", "color('#783DCE')"],
            ["${bldg:measuredHeight}>=38", "color('#723DC1')"],
            ["${bldg:measuredHeight}>=33", "color('#6D3DB4')"],
            ["${bldg:measuredHeight}>=28", "color('#683DA7')"],
            ["${bldg:measuredHeight}>=23", "color('#633D9A')"],
            ["${bldg:measuredHeight}>=18", "color('#5D3C8E')"],
            ["${bldg:measuredHeight}>=13", "color('#573B82')"],
            ["${bldg:measuredHeight}>=8", "color('#523A75')"],
            ["${bldg:measuredHeight}>=3", "color('#4C3969')"],
            ["true", "color('#FFFFFF')"]
          ]
        }
      },
      colorBlendMode: "highlight",
      pbr: "withTexture",
      shadows: "disabled"
    }
  }
};

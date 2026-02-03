import { PresetStyle } from "../types";

export const plateauBuildingColorByUsage: PresetStyle = {
  id: "plateauBuildingColorByUsage",
  title: "Building Color by Useage",
  testId: "preset-style-plateau-building-color-by-usage",
  style: {
    "3dtiles": {
      color: {
        expression: {
          conditions: [
            ["${bldg:usage}==='不明'", "color('#e6e6fa')"],
            ["${bldg:usage}==='その他'", "color('#d8bfd8')"],
            ["${bldg:usage}==='防衛施設'", "color('#b22222')"],
            ["${bldg:usage}==='供給処理施設'", "color('#7b4720')"],
            ["${bldg:usage}==='農林漁業用施設'", "color('#008000')"],
            ["${bldg:usage}==='工場'", "color('#87cefa')"],
            ["${bldg:usage}==='運輸倉庫施設'", "color('#9370db')"],
            ["${bldg:usage}==='文教厚生施設'", "color('#2e1ef4')"],
            ["${bldg:usage}==='官公庁施設'", "color('#4169e1')"],
            ["${bldg:usage}==='作業所併用住宅'", "color('#00ffff')"],
            ["${bldg:usage}==='店舗等併用共同住宅'", "color('#00ffff')"],
            ["${bldg:usage}==='店舗等併用住宅'", "color('#00ffff')"],
            ["${bldg:usage}==='共同住宅'", "color('#00ff7f')"],
            ["${bldg:usage}==='住宅'", "color('#32cd32')"],
            ["${bldg:usage}==='商業系複合施設'", "color('#ff4500')"],
            ["${bldg:usage}==='宿泊施設'", "color('#ffff00')"],
            ["${bldg:usage}==='商業施設'", "color('#ff4500')"],
            ["${bldg:usage}==='業務施設'", "color('#ff7f50')"],
            ["true", "color('#ffffff')"]
          ]
        }
      },
      colorBlendMode: "highlight",
      pbr: "withTexture",
      shadows: "disabled"
    }
  }
};

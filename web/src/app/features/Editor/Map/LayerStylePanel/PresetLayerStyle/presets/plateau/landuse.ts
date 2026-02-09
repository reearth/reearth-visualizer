import { PresetStyle } from "../types";

export const plateauLanduse: PresetStyle = {
  id: "plateauLanduse",
  title: "Land Use",
  titleJa: "土地利用",
  testId: "preset-style-plateau-landuse",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            [
              'startsWith(${attributes["luse:class"]}, "田")',
              "color('#F9F06F')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "畑")',
              "color('#F5BC55')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "山林")',
              "color('#00dc00')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "水面")',
              "color('#0091C5')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他自然地")',
              "color('#C69885')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "住宅用地")',
              "color('#E8868F')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "商業用地")',
              "color('#DF5555')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "工業用地")',
              "color('#0073B0')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "公益施設用地")',
              "color('#D691B5')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "道路用地")',
              "color('#949AB3')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "交通施設用地")',
              "color('#B0A2BF')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "公共空地")',
              "color('#c8ffc8')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他①")',
              "color('#77945B')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他②")',
              "color('#652A60')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他②")',
              "color('#652A60')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他③")',
              "color('#5E5C60')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他④")',
              "color('#7C745F')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "可住地")',
              "color('#D7157E')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "原野・牧野")',
              "color('#C69885')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "住宅")',
              "color('#FF1493')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "共同住宅")',
              "color('#DC143C')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "作業所併用住宅")',
              "color('#800000')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "業務施設")',
              "color('#B22222')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "商業施設")',
              "color('#FFA07A')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "官公庁施設")',
              "color('#93CCA4')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "文教厚生施設")',
              "color('#7B68EE')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "供給処理施設")',
              "color('#00FFFF')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "公園・緑地")',
              "color('#53B3B5')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "墓園")',
              "color('#463042')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他公的施設用地")',
              "color('#6603FC')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "空地")',
              "color('#F1C7FF')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "農林漁業施設用地")',
              "color('#99FF00')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "不明")',
              "color('#333333')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "農地")',
              "color('#F9F06F')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "宅地")',
              "color('#FF1558')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "建築敷地")',
              "color('#FF1558')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "空地")',
              "color('#F1C7FF')"
            ],
            [
              '${attributes["luse:class"]} === "宅地（住宅用地、商業用地等の区分が無い）"',
              "color('#FF5E8C')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "道路・鉄軌道敷")',
              "color('#CECECE')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "農地")',
              "color('#F9F06F')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "低未利用土地")',
              "color('#D765DC')"
            ],
            [
              'startsWith(${attributes["luse:class"]}, "その他")',
              "color('#555053')"
            ],
            ["true", "color('#ffffff')"]
          ]
        }
      },
      stroke: false
    }
  }
};

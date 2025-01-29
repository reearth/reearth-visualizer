import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "override-layer-data-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: override-layer-data-plugin
name: Override Layer Data
version: 1.0.0
extensions:
  - id: override-layer-data
    type: widget
    name: Override Layer Data
    description: Override Layer Data
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "override-layer-data",
  title: "override-layer-data.js",
  sourceCode: `//
// ========== 1) UI 側: ボタン操作で四隅を拡大して送信 ==========
//
reearth.ui.show(\`
<style>
  #scaleBtn {
    padding: 8px;
    border-radius: 4px;
    border: none;
    background: #fffafa;
    color: #000000;
    cursor: pointer;
    width: 200px;
    height: 60px;
    font-size: 16px 
  }
  #scaleBtn:active {
  background: #dcdcdc;
  }
  
</style>
<button id="scaleBtn">Scale Polygon</button>

<script>
  // 初期ポリゴン (南北アメリカ方面を想定? そのまま使用)
  let corners = [
    [-104.18583328622142, 45.40439609826688],
    [-65.64945367690679,  45.99933007244422],
    [-69.5510586832507,   26.483465303049478],
    [-99.39529141009926,  26.00853862085437],
    // 最後の頂点は、最初の頂点と同じにすることでポリゴンを閉じる
    [-104.18583328622142, 45.40439609826688],
  ];

  // 1回目の投稿: 初期形状をPluginへ送信して描画してもらう
  parent.postMessage({
    action: "updatePolygon",
    payload: { corners },
  }, "*");

  // ボタンを押すと、ポリゴンの四隅を拡大
  const btn = document.getElementById("scaleBtn");
  btn.addEventListener("click", () => {
    // 1) ポリゴンの中心(重心)を計算
    const { centerLng, centerLat } = getCenter(corners);

    // 2) 各頂点を中心から少し引き離す (スケールアップ)
    //    例: スケール係数 1.05 (5%拡大)
    const scaleFactor = 1.05;
    corners = corners.map(([lng, lat]) => {
      const diffLng = lng - centerLng;
      const diffLat = lat - centerLat;
      return [
        centerLng + diffLng * scaleFactor,
        centerLat + diffLat * scaleFactor,
      ];
    });

    // 再度末尾を先頭と同じ座標に合わせてポリゴンを閉じる
    corners[corners.length - 1] = corners[0];

    // 3) 新しい頂点情報を Plugin 側へ送る
    parent.postMessage({
      action: "updatePolygon",
      payload: { corners },
    }, "*");
  });

  // ポリゴンの重心を計算する関数 (単純に平均をとる方法)
  function getCenter(coords) {
    let sumLng = 0;
    let sumLat = 0;
    coords.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });
    const n = coords.length;
    return {
      centerLng: sumLng / n,
      centerLat: sumLat / n,
    };
  }
</script>
\`);

//
// ========== 2) Plugin 側: 初期レイヤーを作り、ポリゴン座標を受け取り更新 ==========
//

// 初期表示時にポリゴンをセット
let polygonLayerId;

// 1) 初期レイヤーを作成 (空の GeoJSON)
function createInitialPolygonLayer() {
  if (polygonLayerId) return;

  polygonLayerId = reearth.layers.add({
    type: "simple",
    name: "Growing Polygon",
    data: {
      type: "geojson",
      value: {
        type: "FeatureCollection",
        features: [],
      },
    },
    polygon: {
      fillColor: "#f8f8ff80",
      stroke:true,
      strokeColor:"white",
      strokeWidth: 3,
    },
  });
}

// 2) UI 側からポリゴンの新しい頂点を受け取り、override で更新
reearth.extension.on("message", msg => {
  if (msg.action === "updatePolygon") {
    const corners = msg.payload?.corners;
    if (!corners || corners.length < 4) return;

    // レイヤーがまだ無ければ作成
    createInitialPolygonLayer();

    // GeoJSON Feature
    const feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [corners], // Polygonは [ [ [lng, lat], ... ] ]
      },
      properties: {},
    };

    // override でジオメトリ更新
    reearth.layers.override(polygonLayerId, {
      data: {
        type: "geojson",
        value: {
          type: "FeatureCollection",
          features: [feature],
        },
      },
    });
  }
});

// 初期レイヤー作成
createInitialPolygonLayer();
`
};

export const overrideLayerData: PluginType = {
  id: "Override Layer Data",
  title: "Override Layer Data",
  files: [widgetFile, yamlFile]
};

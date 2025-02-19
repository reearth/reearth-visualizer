import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "take-screenshot-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: take-screenshot-plugin
name: Take Screenshot
version: 1.0.0
extensions:
  - id: take-screenshot
    type: widget
    name: Take Screenshot
    description: Take Screenshot
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "take-screenshot",
  title: "take-screenshot.js",
  sourceCode: `// This example shows how to take a Screenshot //

// ================================
// Define Plug-in UI side (iframe)
// ================================
  
reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
<style>
  .btn {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #808080;
    background: #ffffff;
    color: #000000;
    cursor: pointer;
    width: 150px;
    height: 30px;
    font-size: 11px 
  }
  .btn:active {
    background: #dcdcdc;
  }

  #button-container {
  display: flex;
  gap: 8px;           
  }
</style>
<div id = "wrapper">
  <h3 id="message"></h3>
  <div id="button-container">
    <button class="btn" id="screenshot">ScreenShot</button>
    <button class="btn" id="download">Download</button>
  </div>
</div>

  
<script>
  const screenshotBtn = document.getElementById("screenshot");
  const downloadBtn = document.getElementById("download");
  const message = document.getElementById("message");

  let screenshotDataUri = null;

  screenshotBtn.addEventListener("click", () => {
    parent.postMessage({ action: "takeScreenshot" }, "*");
  });

  // 2. Extension(プラグイン本体)からのメッセージを受け取る
  window.addEventListener("message", e => {
    const { action, data } = e.data || {};
    if (action === "screenshotCaptured" && data) {
      screenshotDataUri = data;
      message.textContent = "Capture complete!";
    }
  });

  downloadBtn.addEventListener("click", () => {
    downloadImage(screenshotDataUri, "screenshot.png");
    message.textContent = ""
  });

  // ダウンロード用の関数 (Base64を実際にファイルとして保存)
  function downloadImage(uri, filename) {
    const a = document.createElement("a");
    a.href = uri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>
\`);

// ================================
// Define Re:Earth(Web Assembly) side
// ================================

reearth.extension.on("message", async (msg) => {
  const { action } = msg;
  if (action === "takeScreenshot") {
    const screenShot = reearth.viewer.capture("image/png");
    reearth.ui.postMessage({
      action: "screenshotCaptured",
      data: screenShot,
    });
  }
});
`
};

export const takeScreenshot: PluginType = {
  id: "take-screenshot",
  title: "Take Screenshot",
  files: [widgetFile, yamlFile]
};

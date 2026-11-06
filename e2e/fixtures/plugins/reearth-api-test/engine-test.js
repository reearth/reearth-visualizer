// Engine API Test Fragment
// API coverage: reearth.engine.name, reearth.apiVersion
// (read inside the plugin sandbox and sent back to the iframe)
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="engine-info">Engine Info</button>
  <output id="engine-info-result"></output>
  <script>
    document.getElementById("engine-info").addEventListener("click", function() {
      parent.postMessage({ action: "engine-info" }, "*");
    });
    window.addEventListener("message", function(e) {
      if (e.data && e.data.action === "engine-info-result") {
        document.getElementById("engine-info-result").textContent =
          JSON.stringify({ name: e.data.name, apiVersion: e.data.apiVersion });
      }
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "engine-info") {
    reearth.ui.postMessage({
      action: "engine-info-result",
      name: reearth.engine.name,
      apiVersion: reearth.apiVersion
    });
  }
};

// Viewer API Test Fragment
// API coverage: reearth.viewer.interactionMode.override
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="viewer-mode-move">Viewer Mode Move</button>
  <button id="viewer-mode-default">Viewer Mode Default</button>
  <script>
    [
      ["viewer-mode-move", "viewer-mode-move"],
      ["viewer-mode-default", "viewer-mode-default"]
    ].forEach(function(pair) {
      document.getElementById(pair[0]).addEventListener("click", function() {
        parent.postMessage({ action: pair[1] }, "*");
      });
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "viewer-mode-move") {
    reearth.viewer.interactionMode.override("move");
  } else if (action === "viewer-mode-default") {
    reearth.viewer.interactionMode.override("default");
  }
};

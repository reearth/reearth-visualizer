// Camera API Test Fragment
// API coverage: reearth.camera — setView, flyTo, zoomIn
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="set-tokyo">Set Tokyo</button>
  <button id="fly-sydney">Fly Sydney</button>
  <button id="zoom-in">Zoom In</button>
  <script>
    document.getElementById("set-tokyo").addEventListener("click", function() {
      parent.postMessage({ action: "set-tokyo" }, "*");
    });
    document.getElementById("fly-sydney").addEventListener("click", function() {
      parent.postMessage({ action: "fly-sydney" }, "*");
    });
    document.getElementById("zoom-in").addEventListener("click", function() {
      parent.postMessage({ action: "zoom-in" }, "*");
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "set-tokyo") {
    reearth.camera.setView({
      lat: 35.681,
      lng: 139.767,
      height: 10000,
      heading: 0,
      pitch: -Math.PI / 2,
      roll: 0
    });
  } else if (action === "fly-sydney") {
    reearth.camera.flyTo(
      {
        lat: -33.87,
        lng: 151.21,
        height: 20000,
        heading: 0,
        pitch: -Math.PI / 2
      },
      { duration: 1 }
    );
  } else if (action === "zoom-in") {
    reearth.camera.zoomIn(2);
  }
};

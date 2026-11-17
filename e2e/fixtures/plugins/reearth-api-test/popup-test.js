// Popup API Test Fragment
// API coverage: reearth.popup — show, postMessage, update, close, on("close")
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="popup-show">Popup Show</button>
  <button id="popup-post">Popup Post</button>
  <button id="popup-update">Popup Update</button>
  <button id="popup-close">Popup Close</button>
  <output id="popup-closed-count">0</output>
  <script>
    [
      ["popup-show", "popup-show"],
      ["popup-post", "popup-post"],
      ["popup-update", "popup-update"],
      ["popup-close", "popup-close"]
    ].forEach(function(pair) {
      document.getElementById(pair[0]).addEventListener("click", function() {
        parent.postMessage({ action: pair[1] }, "*");
      });
    });
    window.addEventListener("message", function(e) {
      if (e.data && e.data.action === "popup-closed") {
        var out = document.getElementById("popup-closed-count");
        out.textContent = String(Number(out.textContent) + 1);
      }
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "popup-show") {
    reearth.popup.on("close", function() {
      reearth.ui.postMessage({ action: "popup-closed" });
    }, { once: true });
    reearth.popup.show(
      '<button id="popup-inner">Popup Inner</button>' +
      '<output id="popup-received"></output>' +
      '<script>window.addEventListener("message", function(e) {' +
      'document.getElementById("popup-received").textContent = JSON.stringify(e.data);' +
      '});</script>',
      { width: 300, height: 200 }
    );
  } else if (action === "popup-post") {
    reearth.popup.postMessage({ text: "hello popup" });
  } else if (action === "popup-update") {
    reearth.popup.update({ width: 500, height: 200 });
  } else if (action === "popup-close") {
    reearth.popup.close();
  }
};

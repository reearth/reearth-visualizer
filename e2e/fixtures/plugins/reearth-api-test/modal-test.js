// Modal API Test Fragment
// API coverage: reearth.modal — show, postMessage, update, close, on("close")
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="modal-show">Modal Show</button>
  <button id="modal-post">Modal Post</button>
  <button id="modal-update">Modal Update</button>
  <button id="modal-close">Modal Close</button>
  <output id="modal-closed-count">0</output>
  <script>
    [
      ["modal-show", "modal-show"],
      ["modal-post", "modal-post"],
      ["modal-update", "modal-update"],
      ["modal-close", "modal-close"]
    ].forEach(function(pair) {
      document.getElementById(pair[0]).addEventListener("click", function() {
        parent.postMessage({ action: pair[1] }, "*");
      });
    });
    window.addEventListener("message", function(e) {
      if (e.data && e.data.action === "modal-closed") {
        var out = document.getElementById("modal-closed-count");
        out.textContent = String(Number(out.textContent) + 1);
      }
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "modal-show") {
    reearth.modal.on("close", function() {
      reearth.ui.postMessage({ action: "modal-closed" });
    }, { once: true });
    reearth.modal.show(
      '<button id="modal-inner">Modal Inner</button>' +
      '<output id="modal-received"></output>' +
      '<script>window.addEventListener("message", function(e) {' +
      'document.getElementById("modal-received").textContent = JSON.stringify(e.data);' +
      '});</script>',
      { width: 300, height: 200, background: "rgba(0,0,0,0.5)", clickBgToClose: true }
    );
  } else if (action === "modal-post") {
    reearth.modal.postMessage({ text: "hello modal" });
  } else if (action === "modal-update") {
    reearth.modal.update({ width: 500, height: 200, background: "rgba(0,0,0,0.5)", clickBgToClose: true });
  } else if (action === "modal-close") {
    reearth.modal.close();
  }
};

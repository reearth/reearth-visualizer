// Data API Test Fragment
// API coverage: reearth.data.clientStorage — setAsync, getAsync, keysAsync, deleteAsync, dropStoreAsync
// (a fixed sequence runs inside the plugin sandbox; the step results are sent back to the iframe)
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="data-storage-run">Data Storage Run</button>
  <output id="data-storage-result"></output>
  <script>
    document.getElementById("data-storage-run").addEventListener("click", function() {
      parent.postMessage({ action: "data-storage-run" }, "*");
    });
    window.addEventListener("message", function(e) {
      if (e.data && e.data.action === "data-storage-result") {
        document.getElementById("data-storage-result").textContent =
          JSON.stringify(e.data.result);
      }
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "data-storage-run") {
    var storage = reearth.data.clientStorage;
    var result = {};
    storage.dropStoreAsync()
      .then(function() { return storage.setAsync("e2e-string", "hello"); })
      .then(function() { return storage.setAsync("e2e-number", 42); })
      .then(function() { return storage.setAsync("e2e-object", { a: 1, nested: { b: [1, 2] } }); })
      .then(function() { return storage.getAsync("e2e-string"); })
      .then(function(v) { result.string = v; return storage.getAsync("e2e-number"); })
      .then(function(v) { result.number = v; return storage.getAsync("e2e-object"); })
      .then(function(v) { result.object = v; return storage.getAsync("e2e-missing"); })
      .then(function(v) { result.missing = v == null; return storage.keysAsync(); })
      .then(function(v) { result.keys = v.slice().sort(); return storage.deleteAsync("e2e-number"); })
      .then(function() { return storage.keysAsync(); })
      .then(function(v) { result.keysAfterDelete = v.slice().sort(); return storage.dropStoreAsync(); })
      .then(function() { return storage.keysAsync(); })
      .then(function(v) { result.keysAfterDrop = v; return storage.getAsync("e2e-string"); })
      .then(function(v) {
        result.stringAfterDrop = v == null;
        reearth.ui.postMessage({ action: "data-storage-result", result: result });
      })
      .catch(function(err) {
        reearth.ui.postMessage({
          action: "data-storage-result",
          result: { error: String(err) }
        });
      });
  }
};

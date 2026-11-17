// Data API Test Fragment
// API coverage: reearth.data.clientStorage — setAsync, getAsync, keysAsync, deleteAsync, dropStoreAsync
// The plugin runs ONE storage call per "data-op" message and sends the result back as
// "data-op-result". The spec sends the messages from the iframe and decides the steps.
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="data-ready" disabled>Data Storage</button>
`;

exports.onMessage = function(msg) {
  if (msg.action === "data-op") {
    var storage = reearth.data.clientStorage;
    storage[msg.op].apply(storage, msg.args || []).then(
      function(value) {
        reearth.ui.postMessage({ action: "data-op-result", id: msg.id, value: value });
      },
      function(err) {
        reearth.ui.postMessage({ action: "data-op-result", id: msg.id, error: String(err) });
      }
    );
  }
};

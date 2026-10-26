// Timeline API Test Fragment
// API coverage: reearth.timeline — setSpeed, setStepType, setRangeType, setTime, play, pause
//
// BUILD FRAGMENT — do not call reearth APIs directly at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="timeline-set-speed">Timeline Speed 10x</button>
  <button id="timeline-set-step-fixed">Timeline Step Fixed</button>
  <button id="timeline-set-range-bounced">Timeline Range Bounced</button>
  <button id="timeline-set-time">Timeline Set Time</button>
  <button id="timeline-play">Timeline Play</button>
  <button id="timeline-pause">Timeline Pause</button>
  <script>
    [
      ["timeline-set-speed", "timeline-set-speed"],
      ["timeline-set-step-fixed", "timeline-set-step-fixed"],
      ["timeline-set-range-bounced", "timeline-set-range-bounced"],
      ["timeline-set-time", "timeline-set-time"],
      ["timeline-play", "timeline-play"],
      ["timeline-pause", "timeline-pause"]
    ].forEach(function(pair) {
      document.getElementById(pair[0]).addEventListener("click", function() {
        parent.postMessage({ action: pair[1] }, "*");
      });
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "timeline-set-speed") {
    reearth.timeline.setSpeed(10);
  } else if (action === "timeline-set-step-fixed") {
    reearth.timeline.setStepType("fixed");
  } else if (action === "timeline-set-range-bounced") {
    reearth.timeline.setRangeType("bounced");
  } else if (action === "timeline-set-time") {
    reearth.timeline.setTime({
      start: "2024-01-01T00:00:00Z",
      stop: "2024-01-02T00:00:00Z",
      current: "2024-01-01T06:00:00Z"
    });
  } else if (action === "timeline-play") {
    reearth.timeline.play();
  } else if (action === "timeline-pause") {
    reearth.timeline.pause();
  }
};

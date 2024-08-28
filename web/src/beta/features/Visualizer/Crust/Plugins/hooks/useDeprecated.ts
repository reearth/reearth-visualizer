import { useMemo } from "react";

type Props = {
  built?: boolean;
};

export default ({ built }: Props) => {
  const deprecated = useMemo(() => {
    if (built) return {};

    const d = {};
    addWarning(d, "engineName", "reearth.engineName");

    const visualizer = {};
    ["engine", "camera", "property", "overrideProperty"].forEach((name) => {
      addWarning(visualizer, name, `reearth.visualizer.${name}`);
    });
    addProperty(d, "visualizer", visualizer);

    const scene = {};
    [
      "inEditor",
      "built",
      "captureScreen",
      "getLocationFromScreen",
      "sampleTerrainHeight",
      "computeGlobeHeight",
      "getGlobeHeight",
      "toXYZ",
      "toLngLatHeight",
      "convertScreenToPositionOffset",
      "isPositionVisible",
      "toWindowPosition",
      "pickManyFromViewport",
    ].forEach((name) => {
      addWarning(scene, name, `reearth.scene.${name}`);
    });
    addProperty(d, "scene", scene);

    const clock = {};
    [
      "startTime",
      "stopTime",
      "currentTime",
      "playing",
      "paused",
      "speed",
      "stepType",
      "rangeType",
      "tick",
      "play",
      "pause",
      "setTime",
      "setSpeed",
      "setStepType",
      "setRangeType",
    ].forEach((name) => {
      addWarning(clock, name, `reearth.clock.${name}`);
    });
    addProperty(d, "clock", clock);

    const interactionMode = {};
    ["mode", "override"].forEach((name) => {
      addWarning(interactionMode, name, `reearth.interactionMode.${name}`);
    });
    addProperty(d, "interactionMode", interactionMode);

    const plugins = {};
    ["instances", "postMessage"].forEach((name) => {
      addWarning(plugins, name, `reearth.plugins.${name}`);
    });
    addProperty(d, "plugins", plugins);

    const plugin = {};
    ["id", "extensionId", "extensionType", "property"].forEach((name) => {
      addWarning(plugin, name, `reearth.plugin.${name}`);
    });
    addProperty(d, "plugin", plugin);

    const clientStorage = {};
    ["getAsync", "setAsync", "deleteAsync", "keysAsync", "dropStore"].forEach(
      (name) => {
        addWarning(clientStorage, name, `reearth.clientStorage.${name}`);
      },
    );

    addEventWarning(d, "on");
    addEventWarning(d, "off");
    addEventWarning(d, "once", true);

    return d;
  }, [built]);

  const cameraDeprecated = useMemo(() => {
    if (built) return {};
    const d = {};
    [
      "getFovInfo",
      "flyToBBox",
      "rotateOnCenter",
      "lookHorizontal",
      "lookVertical",
      "moveForward",
      "moveBackward",
      "moveUp",
      "moveDown",
      "moveLeft",
      "moveRight",
      "flyToGround",
      "overrideScreenSpaceController",
      "forceHorizontalRoll",
    ].forEach((name) => {
      addWarning(d, name, `reearth.camera.${name}`);
    });
    return d;
  }, [built]);

  const layersDeprecated = useMemo(() => {
    if (built) return {};
    const d = {};
    [
      "overrideProperty",
      "tags",
      "findByTags",
      "findByTagLabels",
      "replace",
      "walk",
      "selectionReason",
      "overriddenInfobox",
      "defaultInfobox",
      "isLayer",
      "overriddenProperties",
    ].forEach((name) => {
      addWarning(d, name, `reearth.layers.${name}`);
    });
    return d;
  }, [built]);

  const sketchDeprecated = useMemo(() => {
    if (built) return {};
    const d = {};
    [
      "setType",
      "setColor",
      "disableShadow",
      "setDefaultAppearance",
      "createDataOnly",
      "enableRelativeHeight",
      "allowRightClickToAbort",
      "allowAutoResetInteractionMode",
    ].forEach((name) => {
      addWarning(d, name, `reearth.sketch.${name}`);
    });
    return d;
  }, [built]);

  return {
    deprecated,
    cameraDeprecated,
    layersDeprecated,
    sketchDeprecated,
  };
};

const deprecatedMap = {
  "reearth.engineName": "reearth.engine.name",
  "reearth.visualizer.engine": "reearth.engine.name",
  "reearth.visualizer.camera": "reearth.camera",
  "reearth.visualizer.property": "reearth.viewer.property",
  "reearth.visualizer.overrideProperty": "reearth.viewer.overrideProperty",
  "reearth.scene.inEditor": "reearth.viewer.env.inEditor",
  "reearth.scene.built": "reearth.viewer.env.isBuilt",
  "reearth.scene.captureScreen": "reearth.viewer.viewport.capture",
  "reearth.scene.getLocationFromScreen":
    "reearth.viewer.tools.getLocationFromScreenCoordinate",
  "reearth.scene.sampleTerrainHeight":
    "reearth.viewer.tools.getTerrainHeightAsync",
  "reearth.scene.computeGlobeHeight": "reearth.viewer.tools.getGlobeHeight",
  "reearth.scene.getGlobeHeight": "reearth.viewer.tools.getGlobeHeightByCamera",
  "reearth.scene.toXYZ": "reearth.viewer.tools.cartographicToCartesian",
  "reearth.scene.toLngLatHeight":
    "reearth.viewer.tools.cartesianToCartographic",
  "reearth.scene.convertScreenToPositionOffset":
    "reearth.viewer.tools.transformByOffsetOnScreen",
  "reearth.scene.isPositionVisible":
    "reearth.viewer.tools.isPositionVisibleOnGlobe",
  "reearth.scene.toWindowPosition":
    "reearth.viewer.tools.getScreenCoordinateFromPosition",
  "reearth.scene.pickManyFromViewport":
    "reearth.layers.getFeaturesFromViewport",
  "reearth.clock.startTime": "reearth.timeline.startTime",
  "reearth.clock.stopTime": "reearth.timeline.stopTime",
  "reearth.clock.currentTime": "reearth.timeline.currentTime",
  "reearth.clock.playing": "reearth.timeline.isPlaying",
  "reearth.clock.paused": "!reearth.timeline.isPlaying",
  "reearth.clock.speed": "reearth.timeline.speed",
  "reearth.clock.stepType": "reearth.timeline.stepType",
  "reearth.clock.rangeType": "reearth.timeline.rangeType",
  "reearth.clock.tick": "reearth.timeline.tick",
  "reearth.clock.play": "reearth.timeline.play",
  "reearth.clock.pause": "reearth.timeline.pause",
  "reearth.clock.setTime": "reearth.timeline.setTime",
  "reearth.clock.setSpeed": "reearth.timeline.setSpeed",
  "reearth.clock.setStepType": "reearth.timeline.setStepType",
  "reearth.clock.setRangeType": "reearth.timeline.setRangeType",
  "reearth.interactionMode.mode": "reearth.viewer.interactionMode.mode",
  "reearth.interactionMode.override": "reearth.viewer.interactionMode.override",
  "reearth.plugins.instances": "reearth.extensions.list",
  "reearth.plugins.postMessage": "reearth.extensions.postMessage",
  "reearth.plugin.id":
    "reearth.extension.widget.pluginId or reearth.extension.block.pluginId",
  "reearth.plugin.extensionId":
    "reearth.extension.widget.extensionId or reearth.extension.block.extensionId",
  "reearth.plugin.property":
    "reearth.extension.widget.property or reearth.extension.block.property",
  "reearth.camera.getFovInfo": "reearth.camera.getGlobeIntersection",
  "reearth.camera.flyToBBox": "reearth.camera.flyToBoundingBox",
  "reearth.camera.rotateOnCenter": "reearth.camera.rotateAround",
  "reearth.camera.lookHorizontal":
    "reearth.camera.overrideScreenSpaceCameraController",
  "reearth.camera.lookVertical":
    "reearth.camera.overrideScreenSpaceCameraController",
  "reearth.camera.moveForward": "reearth.camera.move",
  "reearth.camera.moveBackward": "reearth.camera.move",
  "reearth.camera.moveUp": "reearth.camera.move",
  "reearth.camera.moveDown": "reearth.camera.move",
  "reearth.camera.moveLeft": "reearth.camera.move",
  "reearth.camera.moveRight": "reearth.camera.move",
  "reearth.camera.flyToGround":
    "reearth.camera.flyTo with manully getting the target height",
  "reearth.camera.overrideScreenSpaceController":
    "reearth.camera.overrideScreenSpaceCameraController",
  "reearth.layers.overrideProperty": "reearth.layers.override",
  "reearth.layers.overriddenProperties": "reearth.layers.overridden",
  "reearth.camera.forceHorizontalRoll":
    "reearth.camera.enableForceHorizontalRoll",
  "reearth.sketch.setType": "reearth.sketch.setTool",
  "reearth.sketch.setColor": "reearth.sketch.overrideOptions",
  "reearth.sketch.disableShadow": "reearth.sketch.overrideOptions",
  "reearth.sketch.setDefaultAppearance": "reearth.sketch.overrideOptions",
  "reearth.sketch.createDataOnly": "reearth.sketch.overrideOptions",
  "reearth.sketch.enableRelativeHeight": "reearth.sketch.overrideOptions",
  "reearth.sketch.allowRightClickToAbort": "reearth.sketch.overrideOptions",
  "reearth.sketch.allowAutoResetInteractionMode":
    "reearth.sketch.overrideOptions",
  "reearth.clientStorage.getAsync": "reearth.data.clientStorage.getAsync",
  "reearth.clientStorage.setAsync": "reearth.data.clientStorage.setAsync",
  "reearth.clientStorage.deleteAsync": "reearth.data.clientStorage.deleteAsync",
  "reearth.clientStorage.keysAsync": "reearth.data.clientStorage.keysAsync",
  "reearth.clientStorage.dropStore":
    "reearth.data.clientStorage.dropStoreAsync",
  "event update": "update event on reearth.ui",
  "event close": "close event on reearth.ui",
  "event cameramove": "move event on reearth.camera",
  "event layeredit": "edit event on reearth.layer",
  "event select": "select event on reearth.layer",
  "event message": "message event on reearth.extension",
  "event click": "click event on reearth.viewer",
  "event doubleclick": "doubleClick event on reearth.viewer",
  "event mousedown": "mouseDown event on reearth.viewer",
  "event mouseup": "mouseUp event on reearth.viewer",
  "event rightclick": "rightClick event on reearth.viewer",
  "event rightdown": "rightDown event on reearth.viewer",
  "event rightup": "rightUp event on reearth.viewer",
  "event middleclick": "middleClick event on reearth.viewer",
  "event middledown": "middleDown event on reearth.viewer",
  "event middleup": "middleUp event on reearth.viewer",
  "event mousemove": "mouseMove event on reearth.viewer",
  "event mouseenter": "mouseEnter event on reearth.viewer",
  "event mouseleave": "mouseLeave event on reearth.viewer",
  "event wheel": "wheel event on reearth.viewer",
  "event tick": "tick event on reearth.timeline",
  "event timelinecommit": "commit event on reearth.timeline",
  "event resize": "resize event on reearth.viewer",
  "event modalclose": "close event on reearth.modal",
  "event popupclose": "close event on reearth.popup",
  "event pluginmessage": "extensionMessage event on reearth.extension",
  "event sketchfeaturecreated": "create event on reearth.sketch",
  "event sketchtypechange": "toolChange event on reearth.sketch",
  "event layerVisibility": "visible event on reearth.layer",
  "event layerload": "load event on reearth.layer",
  "event layerSelectWithRectStart":
    "marqueeStart event on reearth.viewer.interactionMode.selectionMode",
  "event layerSelectWithRectMove":
    "marqueeMove event on reearth.viewer.interactionMode.selectionMode",
  "event layerSelectWithRectEnd":
    "marqueeEnd event on reearth.viewer.interactionMode.selectionMode",
};

function addProperty(obj: object, name: string, value: unknown) {
  Object.defineProperty(obj, name, {
    get() {
      return value;
    },
    enumerable: false,
  });
}

function addWarning(obj: object, name: string, value: string) {
  Object.defineProperty(obj, name, {
    get() {
      return warning(value);
    },
    enumerable: false,
  });
}

function addEventWarning(obj: object, name: string, isOnce = false) {
  Object.defineProperty(obj, name, {
    get() {
      return (eventName: string) => {
        warning(
          `event ${eventName}`,
          isOnce
            ? "Please use method on with option {once: true} instead of once."
            : "",
        );
      };
    },
    enumerable: false,
  });
}

const warningStyle = "background-color: #f90; color: #000; padding: 2px;";

function warning(name: string, additional?: string) {
  const suggestion = Object.keys(deprecatedMap).includes(name)
    ? `Please use ${deprecatedMap[name as keyof typeof deprecatedMap]} instead.`
    : undefined;

  console.warn(
    `%cRe:Earth Visualizer Plugin API:%c ${name} is deprecated.${
      suggestion ? ` ${suggestion}` : ""
    }${additional ? ` ${additional}` : ""}`,
    warningStyle,
    "",
  );
}

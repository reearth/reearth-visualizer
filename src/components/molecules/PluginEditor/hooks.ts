import { useState, useMemo, ChangeEvent, useEffect, useCallback } from "react";

import type {
  Widget,
  WidgetAlignSystem,
  WidgetZone,
  WidgetSection,
} from "@reearth/components/molecules/Visualizer";

export type Position = { section: string; area: string };

const originalSourceCode = `
reearth.ui.show(
  \`<style>
      body { 
        margin: 0;
      }
      #wrapper {
        background: #232226;
        height: 100%;
        color: white;
        border: 3px dotted red;
        border-radius: 5px;
        padding: 20px 0;
      }
  </style>
  <div id="wrapper">
    <h2 style="text-align: center; margin: 0;">Hello2 World</h2>
  </div>
  \`
, { visible: true });
`.trim();

const defaultPosition = {
  section: "left",
  area: "top",
};

export default () => {
  const [mode, setMode] = useState("widget");
  const [showInfobox, setShowInfobox] = useState(false);
  const [infoboxSize, setInfoboxSize] = useState<"small" | "medium" | "large">("small");
  const [showAlignSystem, setShowAlignSystem] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position>(defaultPosition);
  const [alignSystem, setAlignSystem] = useState<WidgetAlignSystem | undefined>();
  const [sourceCode, setSourceCode] = useState<{ fileName?: string; body?: string }>({
    fileName: "untitled.js",
    body: originalSourceCode,
  });
  const [hardSourceCode, setHardSourceCode] = useState<{ fileName?: string; body: string }>({
    fileName: "untitled.js",
    body: originalSourceCode,
  });

  const positions: { [key: string]: Position }[] = [
    {
      LeftTop: { section: "left", area: "top" },
      LeftMiddle: { section: "left", area: "middle" },
      LeftBottom: { section: "left", area: "bottom" },
    },
    {
      CenterTop: { section: "center", area: "top" },
      CenterBottom: { section: "center", area: "bottom" },
    },
    {
      RightTop: { section: "right", area: "top" },
      RightMiddle: { section: "right", area: "middle" },
      RightBottom: { section: "right", area: "bottom" },
    },
  ];

  const handleAlignSystemUpdate = (widget: Widget, newLoc: Position) => {
    setAlignSystem(() => {
      const alignment =
        newLoc.section === "center" || newLoc.area === "middle" ? "centered" : "start";
      const newSection: WidgetSection = {
        top: {
          widgets: newLoc.area === "top" ? [widget] : undefined,
          align: alignment,
        },
        middle: {
          widgets: newLoc.area === "middle" ? [widget] : undefined,
          align: alignment,
        },
        bottom: {
          widgets: newLoc.area === "bottom" ? [widget] : undefined,
          align: alignment,
        },
      };

      const newZone: WidgetZone = {
        left: {
          ...(newLoc.section === "left" ? newSection : undefined),
        },
        center: {
          ...(newLoc.section === "center" ? newSection : undefined),
        },
        right: {
          ...(newLoc.section === "right" ? newSection : undefined),
        },
      };
      setCurrentPosition(newLoc);
      return { outer: newZone };
    });
  };
  const handleAlignSystemToggle = () => {
    setShowAlignSystem(!showAlignSystem);
  };

  const handleInfoboxToggle = () => {
    setShowInfobox(!showInfobox);
  };

  const openFile = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async e2 => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      setSourceCode({ fileName: file.name, body });
      setHardSourceCode({ fileName: file.name, body });
    };
    reader.readAsText(file);
  };

  const widget = useMemo(() => {
    return {
      id: "xxx",
      // extended: true,
      __REEARTH_SOURCECODE: sourceCode.body,
    };
  }, [sourceCode.body]);

  const reset = useCallback(() => {
    if (confirm("Are you sure you want to reset?")) {
      setSourceCode(hardSourceCode);
      handleAlignSystemUpdate(widget, defaultPosition);
    }
  }, [widget, hardSourceCode]);

  useEffect(() => {
    handleAlignSystemUpdate(widget, currentPosition);
  }, [widget]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sourceCode,
    widget,
    currentPosition,
    positions,
    mode,
    alignSystem,
    infoboxSize,
    showAlignSystem,
    showInfobox,
    handleAlignSystemToggle,
    handleInfoboxToggle,
    openFile,
    handleAlignSystemUpdate,
    setSourceCode,
    setMode,
    setInfoboxSize,
    reset,
  };
};

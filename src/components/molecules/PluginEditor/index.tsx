import MonacoEditor from "@monaco-editor/react";
import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import Visualizer from "@reearth/components/molecules/Visualizer";
import { styled } from "@reearth/theme";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

import useHooks, { positions } from "./hooks";

const PluginEditor: React.FC = () => {
  const {
    sourceCode,
    currentPosition,
    mode,
    widgets,
    infoboxSize,
    showAlignSystem,
    showInfobox,
    rootLayer,
    setSourceCode,
    setMode,
    setInfoboxSize,
    handleOpen,
    handleDownload,
    handleReset,
    handleAlignSystemToggle,
    setCurrentPosition,
    handleInfoboxToggle,
    handleRun,
  } = useHooks();

  return (
    <DndProvider>
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "stretch" }}>
        <Visualizer
          engine="cesium"
          rootLayerId="root"
          sceneProperty={{ tiles: [{ id: "default", tile_type: "default" }] }}
          selectedLayerId="pluginprimitive"
          pluginBaseUrl={window.REEARTH_CONFIG?.plugins}
          ready={true}
          isEditable={true}
          isBuilt={false}
          small={false}
          style={{ width: "100%" }}
          widgets={widgets}
          rootLayer={rootLayer}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "55%",
            zIndex: 1,
          }}>
          <div
            style={{
              background: "#171618",
              padding: "5px 15px",
            }}>
            <h3>Plugin Editor</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}>
              <div id="title" style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                  }}>
                  <LargeButton style={{ background: "orange" }} onClick={handleRun}>
                    Run
                  </LargeButton>
                  <LargeButton onClick={handleDownload}>Download</LargeButton>
                  <LargeButton onClick={handleReset} style={{ padding: "3px 6px" }}>
                    Reset
                  </LargeButton>
                </div>
                <LargeButton onClick={handleOpen}>Upload your plugin</LargeButton>
              </div>
              <div
                id="options"
                style={{ display: "flex", flexDirection: "column", flex: 1, margin: "4px 0" }}>
                <Button selected={showAlignSystem} onClick={handleAlignSystemToggle}>
                  Widget Align System Positions
                </Button>
                <div
                  style={{
                    display: "flex",
                    maxHeight: `${showAlignSystem ? "100px" : "0"}`,
                    paddingBottom: `${showAlignSystem ? "2px" : "0"}`,
                    overflow: "hidden",
                    transition: "all 1s",
                    borderBottom: `${showAlignSystem ? "1px solid white" : "none"}`,
                  }}>
                  {positions.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}>
                      {Object.keys(p).map(k => (
                        <Button
                          key={k}
                          selected={
                            currentPosition.section === p[k].section &&
                            currentPosition.area === p[k].area
                          }
                          onClick={() =>
                            setCurrentPosition({
                              section: p[k].section,
                              area: p[k].area,
                            })
                          }>
                          {k}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", margin: "4px 0" }}>
                  <Button selected={showInfobox} onClick={handleInfoboxToggle}>
                    Toggle Infobox
                  </Button>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: `${showInfobox ? "100px" : "0"}`,
                      paddingBottom: `${showAlignSystem ? "2px" : "0"}`,
                      overflow: "hidden",
                      transition: "all 1s",
                      borderBottom: `${showInfobox ? "1px solid white" : "none"}`,
                    }}>
                    <Button
                      selected={infoboxSize === "small"}
                      onClick={() => setInfoboxSize("small")}>
                      Small
                    </Button>
                    <Button
                      selected={infoboxSize === "medium"}
                      onClick={() => setInfoboxSize("medium")}>
                      Medium
                    </Button>
                    <Button
                      selected={infoboxSize === "large"}
                      onClick={() => setInfoboxSize("large")}>
                      Large
                    </Button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                  <p>Extension type</p>
                  <select
                    value={mode}
                    onChange={e =>
                      setMode(e.currentTarget.value as "block" | "widget" | "primitive")
                    }>
                    <option value="block">Block</option>
                    <option value="widget">Widget</option>
                  </select>
                </div>
              </div>
              <Icon icon="logo" />
            </div>
          </div>
          <MonacoEditor
            height="100%"
            language="javascript"
            value={sourceCode}
            onChange={setSourceCode}
            theme="vs-dark"
            options={options}
          />
        </div>
      </div>
    </DndProvider>
  );
};

const options = {
  bracketPairColorization: {
    enabled: true,
  },
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
};

export default PluginEditor;

const Button = styled.button<{ selected?: boolean }>`
  background: ${({ selected }) => (selected ? "#3B3CD0" : "white")};
  color: ${({ selected }) => (selected ? "white" : "black")};
  border-radius: 3px;
  margin: 2px;
  padding: 2px;

  :hover {
    background: lightgrey;
  }
`;

const LargeButton = styled(Button)`
  & + & {
    margin-left: 5px;
  }

  padding: 6px 8px;
`;

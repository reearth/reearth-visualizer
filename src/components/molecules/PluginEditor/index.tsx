import MonacoEditor from "@monaco-editor/react";
import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import Visualizer from "@reearth/components/molecules/Visualizer";
import { styled } from "@reearth/theme";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

import useHooks from "./hooks";

const PluginEditor: React.FC = () => {
  const {
    sourceCode,
    widget,
    currentPosition,
    positions,
    mode,
    alignSystem,
    infoboxSize,
    showAlignSystem,
    showInfobox,
    setSourceCode,
    setMode,
    setInfoboxSize,
    handleFileOpen,
    handleFileDownload,
    handleFileReset,
    handleAlignSystemToggle,
    handleAlignSystemUpdate,
    handleInfoboxToggle,
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
          widgets={{
            ...(mode === "widget"
              ? {
                  alignSystem,
                }
              : {}),
          }}
          rootLayer={{
            id: "",
            children: [
              {
                id: "pluginprimitive",
                pluginId: "reearth",
                extensionId: "marker",
                isVisible: true,
                property: {
                  default: {
                    location: { lat: 0, lng: 139 },
                    height: 0,
                  },
                },
                infobox: showInfobox
                  ? {
                      property: {
                        default: {
                          title: "Cool info",
                          bgcolor: "#56051fff",
                          size: infoboxSize,
                        },
                      },
                      blocks: [
                        ...(mode === "block"
                          ? [
                              {
                                id: "xxx",
                                __REEARTH_SOURCECODE: sourceCode.body,
                              } as any,
                            ]
                          : []),
                        {
                          id: "yyy",
                          pluginId: "plugins",
                          extensionId: "block",
                          property: {
                            location: { lat: 0, lng: 139 },
                          },
                        },
                      ],
                    }
                  : undefined,
              },
              ...(mode === "primitive"
                ? [
                    {
                      id: "xxx",
                      __REEARTH_SOURCECODE: sourceCode.body,
                      isVisible: true,
                      property: {
                        location: { lat: 0, lng: 130 },
                      },
                    } as any,
                  ]
                : []),
            ],
          }}
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
              display: "flex",
              justifyContent: "space-between",
              background: "#171618",
              padding: "5px 15px",
            }}>
            <div id="title" style={{ flex: 1 }}>
              <h3>Plugin editor navigation</h3>
              <p>Upload your plugin</p>
              <input type="file" onChange={handleFileOpen}></input>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  margin: "20px 0",
                }}>
                <SaveButton
                  onClick={() => handleFileDownload(sourceCode.body, sourceCode.fileName)}>
                  Save {sourceCode.fileName}
                </SaveButton>
                <Button
                  onClick={handleFileReset}
                  style={{ background: "orange", padding: "3px 6px", marginLeft: "20px" }}>
                  Reset
                </Button>
              </div>
            </div>
            <div
              id="options"
              style={{ display: "flex", flexDirection: "column", flex: 1, margin: "4px 0" }}>
              <p>Options</p>
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
                          handleAlignSystemUpdate(widget, {
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
            <div
              style={{
                flex: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 40px",
              }}>
              <Icon icon="logo" />
            </div>
          </div>
          <MonacoEditor
            height="100%"
            language="javascript"
            value={sourceCode.body}
            onChange={value => {
              setSourceCode(sc => ({ ...sc, body: value }));
            }}
            theme={"vs-dark"}
            options={{
              bracketPairColorization: {
                enabled: true,
              },
              automaticLayout: true,
              minimap: {
                enabled: false,
              },
            }}
          />
        </div>
      </div>
    </DndProvider>
  );
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

const SaveButton = styled(Button)`
  padding: 6px 8px;
`;

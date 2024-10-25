import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { useCallback, useMemo, useState } from "react";
import useFileInput from "use-file-input";

import Code from "./Code";
import Console from "./Console";
// import PluginInspector from "./PluginInspector";
import Plugins from "./Plugins";
import Viewer from "./Viewer";

export default () => {
  const [files, setFiles] = useState<
    {
      name: string;
      sourceCode: string;
    }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sourceCode: string;
  }>();
  const [fileName, setFileName] = useState<string>("");
  const [executableSourceCode, setExecutableSourceCode] = useState<string>("");

  const selectFile = useCallback((fileName: string, sourceCode: string) => {
    setFileName(fileName);
    setExecutableSourceCode(sourceCode);
    setSelectedFile({ name: fileName, sourceCode });
  }, []);

  const handleFileUpload = useFileInput((files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e2) => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      const fileItem = {
        name: file.name,
        sourceCode: body
      };
      setFileName(file.name);
      setExecutableSourceCode(body);
      setFiles((files) => [...files, fileItem]);
    };
    reader.readAsText(file);
  });

  // Note: currently we put visualizer in tab content, so better not have more tabs in this area,
  // otherwise visualizer will got unmount and mount when switching tabs.
  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: "Viewer",
        children: <Viewer />
      }
    ],
    []
  );

  const BottomAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "console",
        name: "Console",
        children: <Console />
      }
    ],
    []
  );

  const SubRightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "plugins",
        name: "Plugins",
        children: (
          <Plugins
            files={files}
            selectedFile={selectedFile ?? files?.[0]}
            selectFile={selectFile}
            handleFileUpload={handleFileUpload}
          />
        )
      }
    ],
    [selectFile, handleFileUpload, files, selectedFile]
  );

  // const RightAreaTabs: TabItem[] = useMemo(
  //   () => [
  //     {
  //       id: "plugin-inspector",
  //       name: "Plugin Inspector",
  //       children: <PluginInspector />
  //     }
  //   ],
  //   []
  // );

  const RightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "code",
        name: "code",
        children: <Code fileName={fileName} sourceCode={executableSourceCode} />
      }
    ],
    [fileName, executableSourceCode]
  );

  return {
    MainAreaTabs,
    BottomAreaTabs,
    SubRightAreaTabs,
    RightAreaTabs
  };
};

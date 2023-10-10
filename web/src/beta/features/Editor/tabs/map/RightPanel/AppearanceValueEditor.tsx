import MonacoEditor from "@monaco-editor/react";
import { FC, useCallback, useState, useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import { useAppearancesFetcher } from "@reearth/services/api";
import { styled } from "@reearth/services/theme";

import { AppearanceValueUpdateProps } from "../../../useAppearances";

type AppearanceEditorProps = {
  selectedAppearanceId?: string;
  sceneId?: string;
  onAppearanceValueUpdate?: (inp: AppearanceValueUpdateProps) => void;
};

const AppearanceEditor: FC<AppearanceEditorProps> = ({
  selectedAppearanceId,
  sceneId,
  onAppearanceValueUpdate,
}) => {
  const [styleCode, setStyleCode] = useState<string | undefined>("{}");

  const { useGetAppearancesQuery } = useAppearancesFetcher();
  const { appearances = [] } = useGetAppearancesQuery({ sceneId });

  useEffect(() => {
    const selectedAppearance = appearances.find(a => a.id === selectedAppearanceId);
    if (selectedAppearance?.value) {
      setStyleCode(JSON.stringify(selectedAppearance.value, null, 2));
    }
  }, [selectedAppearanceId, appearances]);

  const handleSubmit = useCallback(() => {
    if (onAppearanceValueUpdate && styleCode && JSON.parse(styleCode)) {
      selectedAppearanceId &&
        onAppearanceValueUpdate({ styleId: selectedAppearanceId, value: JSON.parse(styleCode) });
    }
  }, [onAppearanceValueUpdate, styleCode, selectedAppearanceId]);

  return (
    <EditorContainer>
      <MonacoEditor
        height="80%"
        language="json"
        theme="vs-dark"
        value={styleCode}
        onChange={setStyleCode}
        options={options}
      />
      <CenteredButton onClick={handleSubmit}>Submit</CenteredButton>
    </EditorContainer>
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
  selectOnLineNumbers: true,
};

const EditorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 1;
`;

const CenteredButton = styled(Button)`
  align-self: center;
  margin-top: 16px; // Adjust as per your need
`;

export default AppearanceEditor;

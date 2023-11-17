import MonacoEditor from "@monaco-editor/react";
import { FC, useCallback, useState, useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { styled } from "@reearth/services/theme";

import { LayerStyleValueUpdateProps } from "../../../useLayerStyles";

type LayerStyleEditorProps = {
  selectedLayerStyleId?: string;
  sceneId?: string;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyleId,
  sceneId,
  onLayerStyleValueUpdate,
}) => {
  const [styleCode, setStyleCode] = useState<string | undefined>("{}");

  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles = [] } = useGetLayerStylesQuery({ sceneId });

  useEffect(() => {
    const selectedLayerStyle = layerStyles.find(a => a.id === selectedLayerStyleId);
    if (selectedLayerStyle?.value) {
      setStyleCode(JSON.stringify(selectedLayerStyle.value, null, 2));
    }
  }, [selectedLayerStyleId, layerStyles]);

  const handleSubmit = useCallback(() => {
    if (onLayerStyleValueUpdate && styleCode && JSON.parse(styleCode)) {
      selectedLayerStyleId &&
        onLayerStyleValueUpdate({
          styleId: selectedLayerStyleId,
          value: JSON.parse(styleCode),
        });
    }
  }, [onLayerStyleValueUpdate, styleCode, selectedLayerStyleId]);

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
`;

const CenteredButton = styled(Button)`
  align-self: center;
  margin-top: 16px;
`;

export default LayerStyleEditor;

import MonacoEditor from "@monaco-editor/react";
import { FC, useCallback, useState, useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import Loading from "@reearth/beta/components/Loading";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { LayerStyleValueUpdateProps } from "../../../useLayerStyles";

type LayerStyleEditorProps = {
  selectedLayerStyleId?: string;
  sceneId?: string;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
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

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyleId,
  sceneId,
  onLayerStyleValueUpdate,
}) => {
  const t = useT();
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
        height="90%"
        language="json"
        theme="vs-dark"
        value={styleCode}
        loading={<Loading />}
        options={options}
        onChange={setStyleCode}
      />
      <CenteredButton size="small" onClick={handleSubmit}>
        {t("Save")}
      </CenteredButton>
    </EditorContainer>
  );
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

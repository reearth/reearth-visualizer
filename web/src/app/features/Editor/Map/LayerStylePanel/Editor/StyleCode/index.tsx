import { CodeInput } from "@reearth/app/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useRef, useState } from "react";

import NoStyleMessage from "../NoStyleMessage";

type CodeProps = {
  layerStyle: LayerStyle | undefined;
  editMode?: boolean;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};

const StyleCode: FC<CodeProps> = ({ layerStyle, editMode, setLayerStyle }) => {
  const [styleCode, setStyleCode] = useState<string | undefined>("");
  const styleCodeRef = useRef<string | undefined>(styleCode);
  styleCodeRef.current = styleCode;

  useEffect(() => {
    setStyleCode(JSON.stringify(layerStyle?.value, null, 2));
  }, [layerStyle]);

  const updateStyle = useCallback(() => {
    try {
      const parsedStyle = JSON.parse(styleCodeRef.current || "");
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          value: parsedStyle
        };
      });
    } catch (_error) {
      // Do nothing
    }
  }, [setLayerStyle]);

  return layerStyle?.id ? (
    <CodeWrapper>
      <CodeInput
        value={styleCode}
        onChange={setStyleCode}
        onBlur={updateStyle}
        language="json"
        showLines={false}
        disabled={!editMode}
      />
    </CodeWrapper>
  ) : (
    <NoStyleMessage />
  );
};

export default StyleCode;

const CodeWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
  height: "100%"
}));

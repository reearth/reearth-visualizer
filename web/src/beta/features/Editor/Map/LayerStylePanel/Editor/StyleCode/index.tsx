import { CodeInput } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useState } from "react";

import NoStyleMessage from "../NoStyleMessage";

type CodeProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};

const StyleCode: FC<CodeProps> = ({ layerStyle, setLayerStyle }) => {
  const [styleCode, setStyleCode] = useState<string | undefined>("");

  useEffect(() => {
    setStyleCode(JSON.stringify(layerStyle?.value, null, 2));
  }, [layerStyle]);

  const handleStyleCodeChange = useCallback(
    (newStyleCode?: string) => {
      try {
        const parsedStyle = JSON.parse(newStyleCode || "");
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

      setStyleCode(newStyleCode);
    },
    [setLayerStyle]
  );

  return layerStyle?.id ? (
    <CodeWrapper>
      <CodeInput
        value={styleCode}
        onChange={handleStyleCodeChange}
        language="json"
        showLines={false}
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

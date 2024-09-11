import { CodeInput } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import NoStyleMessage from "./NoStyleMessage";

type CodeTabProps = {
  hasLayerStyleSelected: boolean;
  styleCode: string | undefined;
  setStyleCode: Dispatch<SetStateAction<string | undefined>>;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};

const CodeTab: FC<CodeTabProps> = ({
  hasLayerStyleSelected,
  styleCode,
  setStyleCode,
  setLayerStyle
}) => {
  const handleStyleCodeChange = (newStyleCode?: string) => {
    const parsedStyle = JSON.parse(newStyleCode || "");
    setLayerStyle((prev) => {
      if (!prev?.id) return prev;
      return {
        ...prev,
        value: parsedStyle
      };
    });
    setStyleCode(newStyleCode);
  };

  return hasLayerStyleSelected ? (
    <CodeInput
      value={styleCode}
      onChange={handleStyleCodeChange}
      language="json"
    />
  ) : (
    <NoStyleMessage />
  );
};

export default CodeTab;

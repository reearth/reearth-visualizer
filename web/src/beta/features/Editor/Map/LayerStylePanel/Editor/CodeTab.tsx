import { CodeInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import NoStyleMessage from "./NoStyleMessage";

type CodeTabProps = {
  hasLayerStyleSelected: boolean;
  styleCode: string | undefined;
  setStyleCode: Dispatch<SetStateAction<string | undefined>>;
};

const CodeTab: FC<CodeTabProps> = ({
  hasLayerStyleSelected,
  styleCode,
  setStyleCode
}) => {
  const handleStyleCodeChange = (newStyleCode?: string) => {
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

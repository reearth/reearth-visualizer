import { useMedia } from "react-use";

import OverlayWithMessage from "@reearth/components/atoms/OverlayWithMessage";
import { useT } from "@reearth/i18n";

const BrowserWidthWarning: React.FC = () => {
  const isSmallWindow = useMedia("(max-width: 900px)");
  const t = useT();
  return (
    <OverlayWithMessage
      title={t("Your browser is too small")}
      content={t(
        "Re:Earth needs at least 900px width to be used effectively. Please resize your browser window.",
      )}
      icon="resize"
      show={isSmallWindow}
    />
  );
};

export default BrowserWidthWarning;

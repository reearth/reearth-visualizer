import { useMedia } from "react-use";

import { useT } from "@reearth/beta/services/i18n";
import OverlayWithMessage from "@reearth/classic/components/atoms/OverlayWithMessage";

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

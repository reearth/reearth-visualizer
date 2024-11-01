import { Modal } from "@reearth/beta/lib/reearth-ui";
import { Credit } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useCallback, useEffect, useState } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import { DataAttributionUI } from "./UI";

export type Props = WidgetProps;

const DataAttribution = ({
  theme,
  widget,
  context: { getCredits } = {}
}: Props): JSX.Element | null => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const handleModalOpen = useCallback(() => setVisible(true), []);
  const handleModalClose = useCallback(() => setVisible(false), []);

  const [visualizerCredits, setVisualizerCredits] = useState<Credit[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (visible) {
      const credits = getCredits?.();
      if (credits) {
        setVisualizerCredits(credits);
      }

      intervalId = setInterval(() => {
        const credits = getCredits?.();
        if (credits) {
          setVisualizerCredits(credits);
          console.log("update", credits);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [getCredits, visible]);

  return (
    <Wrapper>
      <DataLink onClick={handleModalOpen}>{t("Data Attribution")}</DataLink>
      <Modal size="small" visible={visible}>
        <DataAttributionUI
          onClose={handleModalClose}
          theme={theme}
          widget={widget}
          credits={visualizerCredits}
        />
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  ...theme.scrollBar
}));

const DataLink = styled("div")(({ theme }) => ({
  cursor: "pointer",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  "&:hover": {
    color: theme.primary.strong
  }
}));

export default DataAttribution;

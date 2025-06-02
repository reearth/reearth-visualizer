import { Modal } from "@reearth/beta/lib/reearth-ui";
import { Credits } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useCallback, useEffect, useState } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import { useDataAttribution } from "./hooks";
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

  const [visualizerCredits, setVisualizerCredits] = useState<Credits>();

  console.log("visualizerCredits", visualizerCredits);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
      const credits = getCredits?.();
      if (credits) {
        setVisualizerCredits(credits);
      }
      intervalId = setInterval(() => {
        const credits = getCredits?.();
        if (credits) {
          setVisualizerCredits(credits);
        }
      }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [getCredits, visible]);

  const { cesiumCredit, otherCredits } = useDataAttribution({
    credits: visualizerCredits,
    widget
  });
  return (
    <Wrapper>
      {cesiumCredit && (
        <CesiumLink
          target="_blank"
          href={cesiumCredit.creditUrl}
          rel="noreferrer"
        >
          <img src={cesiumCredit.logo} title={cesiumCredit.description} />
        </CesiumLink>
      )}
      <DataLink onClick={handleModalOpen}>{t("Data Attribution")}</DataLink>
      <Modal size="small" visible={visible}>
        <DataAttributionUI
          onClose={handleModalClose}
          theme={theme}
          credits={otherCredits}
        />
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));

const DataLink = styled("div")(({ theme }) => ({
  cursor: "pointer",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  padding: theme.spacing.smallest,
  "&:hover": {
    color: theme.primary.strong
  }
}));

const CesiumLink = styled("a")(() => ({
  height: 33,
}));

export default DataAttribution;

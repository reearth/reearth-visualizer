import { useVisualizerCredits } from "@reearth/beta/features/Visualizer/atoms";
import { Modal } from "@reearth/beta/lib/reearth-ui";
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

  const [visualizerCredits, setVisualizerCredits] = useVisualizerCredits();
  useEffect(() => {
    const updateCredits = () => {
      const credits = getCredits?.();
      if (credits) {
        setVisualizerCredits(credits);
      }
    };
    updateCredits();
    const intervalId = setInterval(updateCredits, 3000);
    return () => clearInterval(intervalId);
  }, [getCredits, setVisualizerCredits]);

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
  ["* ::-webkit-scrollbar"]: {
    width: "8px"
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: "10px"
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: "4px"
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.darker
  }
}));

const DataLink = styled("div")(({ theme }) => ({
  cursor: "pointer",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  "&:hover": {
    color: theme.select.main,
    textDecoration: "underline"
  }
}));

export default DataAttribution;

import { Modal } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useCallback, useState } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import { DataAttributionUI } from "./UI";

export type Props = WidgetProps;

const DataAttribution = ({
  theme,
  widget,
  context: { credits } = {}
}: Props): JSX.Element | null => {
  const t = useT();
  const [visible, setVisible] = useState(false);

  const handleModalOpen = useCallback(() => setVisible(true), []);
  const handleModalClose = useCallback(() => setVisible(false), []);

  return (
    <Wrapper>
      <DataLink onClick={handleModalOpen}>{t("Data Attribution")}</DataLink>
      {visible && (
        <Modal size="small" visible={visible}>
          <DataAttributionUI
            onClose={handleModalClose}
            theme={theme}
            widget={widget}
            credits={credits}
          />
        </Modal>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  width: "100%"
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

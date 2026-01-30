import {
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

type ConfirmModalProp = {
  visible: boolean;
  description?: string;
  title?: string;
  actions?: ReactNode;
};

const ConfirmModal: FC<ConfirmModalProp> = ({
  visible,
  title,
  description,
  actions
}) => {
  return (
    <Modal size="small" visible={visible}>
      <ModalPanel actions={actions} appearance="simple">
        <Wrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">{title}</Typography>
          <Typography size="body">{description}</Typography>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  padding: theme.spacing.large,
  gap: theme.spacing.normal
}));

const WarningIcon = styled(Icon)(({ theme }) => ({
  width: "24px",
  height: "24px",
  color: theme.warning.main
}));

export default ConfirmModal;

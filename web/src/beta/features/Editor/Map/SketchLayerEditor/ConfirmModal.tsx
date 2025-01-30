import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type ConfirmModalProp = {
  visible: boolean;
  onClose?: () => void;
  onSubmit: () => void;
};

const ConfirmModal: FC<ConfirmModalProp> = ({ visible, onClose, onSubmit }) => {
  const t = useT();

  return (
    <Modal size="small" visible={visible}>
      <ModalPanel
        actions={
          <>
            <Button size="normal" title={t("Cancel")} onClick={onClose} />
            <Button
              size="normal"
              title={t("Apply")}
              appearance="primary"
              onClick={onSubmit}
            />
          </>
        }
        appearance="simple"
      >
        <Wrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">{t("Apply Current Edits?")}</Typography>
          <Typography size="body">
            {t(
              "This save will apply to all features in the current layer. Do you want to proceed?"
            )}
          </Typography>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.large,
  gap: theme.spacing.normal
}));

const WarningIcon = styled(Icon)(({ theme }) => ({
  width: "24px",
  height: "24px",
  color: theme.warning.main
}));

export default ConfirmModal;

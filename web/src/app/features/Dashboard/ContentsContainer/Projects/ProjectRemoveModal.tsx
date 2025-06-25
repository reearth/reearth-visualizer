import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  isVisible: boolean;
  disabled?: boolean;
  onClose: () => void;
  onProjectRemove: () => void;
};
const ProjectRemoveModal: FC<Props> = ({
  isVisible,
  disabled,
  onClose,
  onProjectRemove
}) => {
  const t = useT();

  return (
    <Modal size="small" visible={isVisible}>
      <ModalPanel
        actions={
          <>
            <Button size="normal" title={t("Cancel")} onClick={onClose} />
            <Button
              size="normal"
              title={t("Remove")}
              appearance="dangerous"
              disabled={disabled}
              onClick={onProjectRemove}
            />
          </>
        }
        appearance="simple"
      >
        <Wrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">
            {t("Your project will be moved to Recycle Bin.")}
          </Typography>
          <Typography size="body">
            {t(
              "This means the project will no longer be published. But you can still see and recover your project from the Recycle bin."
            )}
          </Typography>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectRemoveModal;

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

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

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onProjectDelete: () => void;
};
const ProjectDeleteModal: FC<Props> = ({
  isVisible,
  onClose,
  onProjectDelete
}) => {
  const t = useT();
  return (
    <Modal size="small" visible={isVisible}>
      <ModalPanel
        actions={
          <>
            <Button size="normal" title="Cancel" onClick={onClose} />
            <Button
              size="normal"
              title="Remove"
              appearance="dangerous"
              onClick={onProjectDelete}
            />
          </>
        }
        appearance="simple"
      >
        <Wrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">
            {t("Your project will be move to trash.")}
          </Typography>
          <Typography size="body">
            {t(
              "This means the project will no longer be published. But you can still see and restore you project from recycle bin."
            )}
          </Typography>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectDeleteModal;

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

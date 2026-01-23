import {
  Button,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  onClose?: () => void;
  onProjectImportErrorLogDownload?: () => void;
};
const ProjectImportErrorModal: FC<Props> = ({
  onClose,
  onProjectImportErrorLogDownload
}) => {
  const t = useT();

  return (
    <Modal size="small" visible data-testid="project-import-failed-modal">
      <ModalPanel
        actions={
          <>
            <Button
              size="normal"
              title={t("Download Error Log")}
              onClick={onProjectImportErrorLogDownload}
            />
            <Button
              size="normal"
              title={t("Ok")}
              appearance="primary"
              onClick={onClose}
            />
          </>
        }
        title={t("Import Failed")}
      >
        <Wrapper>
          <Typography size="body">
            {t("We were unable to import the project.")}
          </Typography>
          <Typography size="body">
            {t(
              "Since this file was exported from the system, the structure should be valid. The issue may be caused by:"
            )}
            <CausesList>
              <li>{t("File corruption or incomplete upload")}</li>
              <li>{t("Version incompatibility")}</li>
              <li>{t("Permission restrictions")}</li>
              <li>{t("A temporary system error")}</li>
            </CausesList>
            {t(
              "Please check the issue and try importing again from the start."
            )}
          </Typography>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectImportErrorModal;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.large,
  gap: theme.spacing.normal
}));

const CausesList = styled("ul")(({ theme }) => ({
  marginTop: theme.spacing.small,
  marginBottom: theme.spacing.small,
  paddingLeft: theme.spacing.large,
  listStyleType: "disc",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

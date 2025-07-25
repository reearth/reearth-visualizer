import {
  Button,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { SelectField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo, useState } from "react";

type Props = {
  visibility: string;
  onClose: () => void;
  onProjectVisibilityChange: (value: string) => void;
};

const ProjectVisibilityModal: FC<Props> = ({
  visibility,
  onClose,
  onProjectVisibilityChange
}) => {
  const t = useT();
  const theme = useTheme();
  
  const [projectVisibility, setProjectVisibility] = useState(visibility);

  const projectVisibilityOptions = useMemo(
    () => [
      { value: "public", label: t("Public") },
      { value: "private", label: t("Private") }
    ],
    [t]
  );
  return (
    <Modal size="small" visible={true}>
      <ModalPanel
        onCancel={onClose}
        title={t("Change Visibility")}
        actions={
          <>
            <Button size="normal" title={t("Cancel")} onClick={onClose} />
            <Button
              size="normal"
              title={t("Confirm visibility")}
              appearance="primary"
              disabled={projectVisibility === visibility || projectVisibility === "private"}
              onClick={() => onProjectVisibilityChange(projectVisibility)}
            />
          </>
        }
      >
        <Wrapper>
          <SelectField
            title={t("Project Visibility")}
            value={projectVisibility}
            onChange={(value) => setProjectVisibility(value as string)}
            data-testid="change-project-visibility-input"
            options={projectVisibilityOptions.map(({ label, value }) => ({
              value,
              label
            }))}
          />
          {projectVisibility === "private" && (
            <Typography size="body" color={theme.dangerous.main}>
              {t(
                "Private projects are only available on paid plans. Please upgrade your plan."
              )}
            </Typography>
          )}
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectVisibilityModal;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.large,
  gap: theme.spacing.normal
}));

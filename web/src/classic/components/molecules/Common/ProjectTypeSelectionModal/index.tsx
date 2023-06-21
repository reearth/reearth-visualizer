import React, { useCallback } from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import Modal from "@reearth/classic/components/atoms/Modal";
import Text from "@reearth/classic/components/atoms/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";

export interface Props {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (projectType: ProjectType) => void;
}

const ProjectTypeSelectionModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const theme = useTheme();
  const handleTypeSelect = useCallback(
    (projectType: ProjectType) => {
      onSubmit?.(projectType);
      onClose?.();
    },
    [onSubmit, onClose],
  );

  const handleCloseModal = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <ModalWrapper isVisible={open} onClose={handleCloseModal}>
      <TitleText size="xl" color={theme.classic.other.white} weight={"bold"}>
        {t("Choose Project Type")}
      </TitleText>
      <ProjectTypeContainer>
        <ProjectTypeItem onClick={() => handleTypeSelect("classic")}>
          <Icon icon="logo" size={101} />
          <Text size="s" color={theme.classic.other.white} weight={"bold"}>
            {t("classic")}
          </Text>
          <HintText size="xs" color={theme.classic.main.weak} weight="normal">
            {t("Create project with classic UI")}
          </HintText>
        </ProjectTypeItem>
        <ProjectTypeItem onClick={() => handleTypeSelect("beta")}>
          <Icon icon="logoColorful" size={101} />
          <Text size="s" color={theme.classic.other.white} weight={"bold"}>
            {t("Beta")}
          </Text>
          <HintText size="xs" color={theme.classic.main.weak} weight="normal">
            {t(
              "Create project with the latest features and UI system (projects might break without prior notice)",
            )}
          </HintText>
        </ProjectTypeItem>
      </ProjectTypeContainer>
    </ModalWrapper>
  );
};

const ModalWrapper = styled(Modal)`
  padding: 20px 32px 36px;
  gap: 12px;
  width: 756px;
  height: 528px;
`;

const TitleText = styled(Text)`
  margin-top: 56px;
  text-align: center;
`;
const ProjectTypeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px 56px 32px 36px;
  gap: 102px;
  height: 373px;
`;

const ProjectTypeItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 12px;
  width: 194px;
  height: 194px;
  border: 1px dashed #4a4a4a;
  cursor: pointer;
`;

const HintText = styled(Text)`
  margin-top: 12px;
  width: 154px;
  height: 42px;
  line-height: 14px;
  text-align: center;
`;

export default ProjectTypeSelectionModal;

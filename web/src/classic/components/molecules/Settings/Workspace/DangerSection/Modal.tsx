import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@reearth/classic/components/atoms/Button";
import Divider from "@reearth/classic/components/atoms/Divider";
import Modal from "@reearth/classic/components/atoms/Modal";
import Text from "@reearth/classic/components/atoms/Text";
import TextBox from "@reearth/classic/components/atoms/TextBox";
import { metricsSizes } from "@reearth/classic/theme";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  className?: string;
  workspace?: {
    id: string;
    name: string;
  };
  isVisible: boolean;
  deleteWorkspace?: () => void;
  onClose?: () => void;
};

const DangerModal: React.FC<Props> = ({ workspace, isVisible, deleteWorkspace, onClose }) => {
  const [disabled, setDisabled] = useState(true);
  const [text, setText] = useState<string>();
  const navigate = useNavigate();
  const t = useT();

  const handleDeletion = useCallback(() => {
    if (workspace && deleteWorkspace && !disabled) {
      deleteWorkspace();
      navigate(`/settings/workspaces`);
    }
  }, [navigate, workspace, deleteWorkspace, disabled]);

  useEffect(() => {
    setDisabled(text !== workspace?.name);
  }, [text, workspace]);
  const theme = useTheme();

  return (
    <Modal title={t("Delete workspace")} isVisible={isVisible} size="sm" onClose={onClose}>
      <Subtitle size="s" color={theme.classic.main.text} weight="bold" center>
        {workspace?.name}
      </Subtitle>
      <Description size="s" color={theme.classic.main.text}>
        {t(`This action cannot be undone.`)}
      </Description>
      <Description size="s" color={theme.classic.main.text}>
        {t(
          `This will permanently delete the workspace and all related projects, assets and datasets for all team members.`,
        )}
      </Description>
      <Divider />
      <Subtitle size="s" color={theme.classic.main.text} weight="bold">
        {t(`Please type your workspace name to continue.`)}
      </Subtitle>
      <StyledTextBox borderColor={theme.classic.main.border} value={text} onChange={setText} />
      <RedButton
        large
        text={t("I am sure I want to delete this workspace.")}
        buttonType="danger"
        disabled={disabled}
        onClick={handleDeletion}
      />
    </Modal>
  );
};

const Subtitle = styled(Text)<{ center?: boolean }>`
  text-align: ${props => (props.center ? "center" : "left")};
  margin: ${metricsSizes.xl}px auto ${metricsSizes.m}px;
`;

const Description = styled(Text)`
  margin: ${metricsSizes["2xl"]}px auto;
`;

const StyledTextBox = styled(TextBox)`
  padding: 0;
  margin: ${metricsSizes.xl}px auto;
`;

const RedButton = styled(Button)<{ disabled: boolean }>`
  border-radius: ${metricsSizes.s}px;
  width: auto;
  font-size: ${fonts.sizes.s}px;
  font-weight: 700;
  margin: 0 auto;
`;

export default DangerModal;

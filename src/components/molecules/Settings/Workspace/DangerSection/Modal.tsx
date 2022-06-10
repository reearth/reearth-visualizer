import { useNavigate } from "@reach/router";
import React, { useEffect, useState, useCallback } from "react";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { metricsSizes } from "@reearth/theme/metrics";

type Props = {
  className?: string;
  team?: {
    id: string;
    name: string;
  };
  isVisible: boolean;
  deleteTeam?: () => void;
  onClose?: () => void;
};

const DangerModal: React.FC<Props> = ({ team, isVisible, deleteTeam, onClose }) => {
  const [disabled, setDisabled] = useState(true);
  const [text, setText] = useState<string>();
  const navigate = useNavigate();
  const t = useT();

  const handleDeletion = useCallback(() => {
    if (team && deleteTeam && !disabled) {
      deleteTeam();
      navigate(`/settings/workspaces`);
    }
  }, [navigate, team, deleteTeam, disabled]);

  useEffect(() => {
    setDisabled(text !== team?.name);
  }, [text, team]);
  const theme = useTheme();

  return (
    <Modal title={t("Delete workspace")} isVisible={isVisible} size="sm" onClose={onClose}>
      <Subtitle size="s" color={theme.main.text} weight="bold" center>
        {team?.name}
      </Subtitle>
      <Description size="s" color={theme.main.text}>
        {t(`This action cannot be undone.`)}
      </Description>
      <Description size="s" color={theme.main.text}>
        {t(
          `This will permanently delete the workspace and all related projects, assets and datasets for all team members.`,
        )}
      </Description>
      <Divider />
      <Subtitle size="s" color={theme.main.text} weight="bold">
        {t(`Please type your workspace name to continue.`)}
      </Subtitle>
      <StyledTextBox borderColor={theme.main.border} value={text} onChange={setText} />
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

import React, { useEffect, useState, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "@reach/router";

import Modal from "@reearth/components/atoms/Modal";
import { fonts, styled, useTheme } from "@reearth/theme";
import Button from "@reearth/components/atoms/Button";
import TextBox from "@reearth/components/atoms/TextBox";
import Divider from "@reearth/components/atoms/Divider";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";

export type ActionType = "archive" | "unarchive" | "delete";

type Props = {
  actionType: ActionType;
  className?: string;
  project?: {
    id: string;
    name: string;
    isArchived: boolean;
  };
  teamId?: string;
  isVisible: boolean;
  archiveProject?: (archived: boolean) => void;
  deleteProject?: () => void;
  onClose?: () => void;
};

const DangerModal: React.FC<Props> = ({
  actionType,
  project,
  teamId,
  isVisible,
  archiveProject,
  deleteProject,
  onClose,
}) => {
  const [disabled, setDisabled] = useState(true);
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const intl = useIntl();

  const handleAction = useCallback(() => {
    if (!project || disabled) return;
    if (actionType === "delete") deleteProject?.();
    if (actionType === "archive") archiveProject?.(true);
    if (actionType === "unarchive") archiveProject?.(false);
    navigate(`/settings/workspace/${teamId}/projects`);
  }, [navigate, archiveProject, deleteProject, actionType, teamId, project, disabled]);

  useEffect(() => {
    if (text == project?.name) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [text, project]);
  const theme = useTheme();

  return (
    <Modal
      title={
        actionType === "delete"
          ? intl.formatMessage({ defaultMessage: "Delete project" })
          : actionType === "archive"
          ? intl.formatMessage({ defaultMessage: "Archive project" })
          : intl.formatMessage({ defaultMessage: "Unarchive project" })
      }
      isVisible={isVisible}
      size="sm"
      onClose={onClose}>
      <Subtitle size="s" color={theme.main.text} weight="bold" center>
        {project?.name}
      </Subtitle>
      {actionType === "archive" && (
        <>
          <Description size="s" color={theme.main.text}>
            {intl.formatMessage({
              defaultMessage: `Archiving your project will put it into a state where you cannot edit it or it's settings.`,
            })}
          </Description>
          <Description size="s" color={theme.main.text}>
            {intl.formatMessage({
              defaultMessage: `Once archived, you can unarchive the repository at any time.`,
            })}
          </Description>
        </>
      )}
      {actionType === "unarchive" && (
        <Description size="s" color={theme.main.text}>
          {intl.formatMessage({
            defaultMessage: `This will bring this repository back to a state it can be editted and worked on by you and your team.`,
          })}
        </Description>
      )}
      {actionType === "delete" && (
        <>
          <Description size="s" color={theme.main.text}>
            {intl.formatMessage({
              defaultMessage: `This action cannot be undone.`,
            })}
          </Description>
          <Description size="s" color={theme.main.text}>
            {intl.formatMessage({
              defaultMessage: `This will permanently delete the project. If the project was published, this also means websites and domains referencing the project will not be able to access it anymore.`,
            })}
          </Description>
        </>
      )}
      <Divider />
      <Subtitle size="s" color={theme.main.text} weight="bold">
        {intl.formatMessage({
          defaultMessage: `Please type your project name to continue.`,
        })}
      </Subtitle>
      <StyledTextBox borderColor={theme.main.border} value={text} onChange={setText} />
      <RedButton
        large
        text={
          actionType === "delete"
            ? intl.formatMessage({ defaultMessage: "I am sure I want to delete this project." })
            : actionType === "archive"
            ? intl.formatMessage({ defaultMessage: "I am sure I want to archive this project." })
            : intl.formatMessage({ defaultMessage: "I am sure I want to unarchive this project." })
        }
        buttonType="danger"
        disabled={disabled}
        onClick={handleAction}
      />
    </Modal>
  );
};

const Subtitle = styled(Text)<{ center?: boolean }>`
  text-align: ${props => (props.center ? "center" : "left")};
  margin: 20px auto 10px;
`;

const Description = styled(Text)`
  margin: 22px auto;
`;

const StyledTextBox = styled(TextBox)`
  padding: 0;
  margin: 20px auto;
`;

const RedButton = styled(Button)<{ disabled: boolean }>`
  border-radius: ${metricsSizes.s}px;
  width: auto;
  font-size: ${fonts.sizes.s}px;
  font-weight: 700;
  margin: 0 auto;
`;

export default DangerModal;

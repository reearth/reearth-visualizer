import { useState, useCallback, Fragment } from "react";
import { Link } from "react-router-dom";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { Project } from "@reearth/beta/features/Navbar/types";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  currentProject: Project;
  workspaceId?: string;
};

type ListItem = {
  text?: string;
  linkTo?: string;
  breakpoint?: boolean;
  icon?: Icons;
  onClick?: () => void;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, workspaceId }) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const [open, setOpen] = useState(false);

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  const menuItems: ListItem[] = [
    {
      text: t("Project settings"),
      linkTo: `/settings/project/${currentProject.id}`,
    },
    {
      text: t("Story"),
      linkTo: `/settings/project/${currentProject.id}/story`,
    },
    {
      text: t("Public"),
      linkTo: `/settings/project/${currentProject.id}/public`,
    },
    {
      text: t("Workspace assets"),
      linkTo: `/settings/project/${currentProject.id}/asset`,
    },
    {
      text: t("Plugin"),
      linkTo: `/settings/project/${currentProject.id}/plugins`,
    },
    { breakpoint: true },
    {
      text: t("Manage projects"),
      linkTo: `/settings/workspaces/${workspaceId}/projects`,
    },
  ];

  if (documentationUrl) {
    menuItems.push(
      ...[
        {
          breakpoint: true,
        },
        {
          text: t("Documentation"),
          icon: "help" as const,
          onClick: () => window.open(documentationUrl, "_blank", "noopener"),
        },
      ],
    );
  }

  return (
    <Popover.Provider open={open} placement="bottom-start" onOpenChange={handlePopOver}>
      <Popover.Trigger asChild>
        <InputWrapper onClick={handlePopOver}>
          <Label size="body" weight="bold" open={open} customColor>
            {currentProject.name}
          </Label>
          <ArrowIcon icon="arrowDown" open={open} size={15} />
        </InputWrapper>
      </Popover.Trigger>
      <PickerWrapper attachToRoot>
        {menuItems?.map(({ text: value, linkTo, breakpoint, icon, onClick }, index) => (
          <Fragment key={index}>
            {breakpoint ? (
              <Spacer />
            ) : linkTo ? (
              <StyledLinkButton to={linkTo}>
                {icon && <StyledIcon icon={icon} size={20} />}
                {value}
              </StyledLinkButton>
            ) : (
              <Option size="body" onClick={onClick}>
                {icon && <StyledIcon icon={icon} size={20} />}
                {value}
              </Option>
            )}
          </Fragment>
        ))}
      </PickerWrapper>
    </Popover.Provider>
  );
};

const InputWrapper = styled.div`
  display: flex;
  position: relative;
  cursor: pointer;
  align-items: center;
`;

const Label = styled(Text)<{ open: boolean }>`
  padding: 7px 12px;
  /* The width + placement of the arrow icon */
  padding-right: 30px;
  width: 100%;
  border-radius: 4px;
  color: ${({ theme }) => theme.content.weak};

  &:focus {
    border: 1px solid ${({ theme }) => theme.select.strong};
  }

  &:focus-visible {
    border: 1px solid ${({ theme }) => theme.select.strong};
    outline: none;
  }

  &:hover {
    color: ${({ theme }) => theme.content.main};
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: ${({ open }) => (open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)")};
  color: ${({ theme }) => theme.content.weak};
`;

const PickerWrapper = styled(Popover.Content)`
  min-width: 180px;
  outline: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[0]};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Spacer = styled.div`
  border-top: 0.5px solid ${({ theme }) => theme.outline.weak};
  margin: 2px 0;
`;

const StyledLinkButton = styled(Link)`
  text-decoration: none;
  padding: 9px 12px;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.content.main};
  :hover {
    text-decoration: none;
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const Option = styled(Text)`
  padding: 9px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.content.main};
`;

export default ProjectMenu;

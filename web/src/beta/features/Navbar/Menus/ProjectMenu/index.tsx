import { useState, useCallback, Fragment } from "react";
import { Link } from "react-router-dom";

import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { Project } from "@reearth/beta/features/Navbar/types";
import { Icon, IconName } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  currentProject: Project;
  workspaceId?: string;
};

type ListItem = {
  text?: string;
  linkTo?: string;
  breakpoint?: boolean;
  icon?: IconName;
  onClick?: () => void;
};

const ProjectMenu: React.FC<Props> = ({ currentProject }) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  const menuItems: ListItem[] = [
    {
      icon: "setting",
      text: t("Project settings"),
      linkTo: `/settings/project/${currentProject.id}`,
    },
    {
      icon: "plugin",
      text: t("Plugin"),
      linkTo: `/settings/project/${currentProject.id}/plugins`,
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
          icon: "book",
          onClick: () => window.open(documentationUrl, "_blank", "noopener"),
        } as ListItem,
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
          <Icon icon="caretDown" size="small" color={theme.content.weak} />
        </InputWrapper>
      </Popover.Trigger>
      <PickerWrapper attachToRoot>
        {menuItems?.map(({ text: value, linkTo, breakpoint, icon, onClick }, index) => (
          <Fragment key={index}>
            {breakpoint ? (
              <Spacer />
            ) : linkTo ? (
              <StyledLinkButton to={linkTo}>
                {icon && <Icon icon={icon} size="normal" color={theme.content.weak} />}
                {value}
              </StyledLinkButton>
            ) : (
              <Option size="body" onClick={onClick}>
                {icon && <Icon icon={icon} size="normal" color={theme.content.weak} />}
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
  cursor: pointer;
  padding: 7px 4px;
  align-items: center;
  border-radius: 4px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const Label = styled(Text)<{ open: boolean }>`
  color: ${({ theme }) => theme.content.weak};
  padding-right: 4px;
  font-size: 12px;
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

const PickerWrapper = styled(Popover.Content)`
  min-width: 180px;
  outline: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
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
  font-size: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.content.main};
  background: "transparent";
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

export default ProjectMenu;

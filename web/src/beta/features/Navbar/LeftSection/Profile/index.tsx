import { Fragment, useCallback, useState } from "react";
import { Link } from "react-router-dom";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../types";

export type Props = {
  workspaces?: Workspace[];
  personalWorkspace?: boolean;
  currentWorkspace?: Workspace;
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

type ListItem = {
  text?: string;
  linkTo?: string;
  breakpoint?: boolean;
  icon?: Icons;
  onClick?: () => void;
  items?: ListItem[];
};

type MenuProps = {
  label?: string;
  items: ListItem[];
  nested?: boolean;
};

const Menu: React.FC<MenuProps> = ({ label, items, nested }) => {
  const [open, setOpen] = useState(false);

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  return (
    <Popover.Provider
      open={open}
      placement={nested ? "right-start" : "bottom-start"}
      onOpenChange={handlePopOver}>
      <Popover.Trigger asChild>
        <InputWrapper onClick={handlePopOver}>
          <Label size="body" weight={nested ? "regular" : "bold"} open={open} customColor={!nested}>
            {label}
          </Label>
          <ArrowIcon icon={nested ? "arrowRight" : "arrowDown"} open={open} size={15} />
        </InputWrapper>
      </Popover.Trigger>
      <PickerWrapper attachToRoot>
        {items?.map(({ text: value, linkTo, breakpoint, icon, onClick, items }, index) => (
          <Fragment key={index}>
            {breakpoint ? (
              <Spacer />
            ) : items ? (
              <Menu label={value} items={items} nested />
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

const HeaderProfile: React.FC<Props> = ({
  currentWorkspace = { id: undefined, name: "" },
  workspaces = [],
  onSignOut,
  onWorkspaceChange,
  openModal,
}) => {
  const t = useT();

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange],
  );

  const menuItems: ListItem[] = [
    { text: t("Account Settings"), linkTo: "/settings/account" },
    {
      text: t("Workspaces"),
      items: [
        ...workspaces.map(w => {
          return {
            text: w.name ?? t("Unknown"),
            selected: currentWorkspace.id === w.id,
            onClick: () => w.id && handleWorkspaceChange(w.id),
          };
        }),
        { text: t("Manage Workspaces"), icon: "workspaces", linkTo: "/settings/workspaces" },
        { text: t("New Workspace"), icon: "workspaceAdd", onClick: openModal },
      ],
    },
    { text: t("Log out"), onClick: onSignOut },
    { breakpoint: true },
    { text: `v${__APP_VERSION__}` },
  ];

  return <Menu label={currentWorkspace.name} items={menuItems} />;
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
  min-width: 200px;
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
export default HeaderProfile;

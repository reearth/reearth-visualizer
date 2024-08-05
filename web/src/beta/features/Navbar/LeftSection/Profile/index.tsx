import { useCallback } from "react";
// import { Link } from "react-router-dom";

// import * as Popover from "@reearth/beta/components/Popover";
import { useNavigate } from "react-router-dom";

import Text from "@reearth/beta/components/Text";
import { PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
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

// type ListItem = {
//   text?: string;
//   linkTo?: string;
//   breakpoint?: boolean;
//   icon?: Icons;
//   onClick?: () => void;
//   items?: ListItem[];
// };

// type MenuProps = {
//   label?: string;
//   items: ListItem[];
//   nested?: boolean;
// };

// const Menu: React.FC<MenuProps> = ({ label, items, nested }) => {
//   const [open, setOpen] = useState(false);
//   const handlePopOver = useCallback(() => setOpen(!open), [open]);

//   return (
//     <Popover.Provider
//       open={open}
//       placement={nested ? "right-start" : "bottom-start"}
//       onOpenChange={handlePopOver}>
//       <Popover.Trigger asChild>
//         <InputWrapper onClick={handlePopOver}>
//           <Label size="body" weight={nested ? "regular" : "bold"} open={open} customColor={!nested}>
//             {label}
//           </Label>
//           <ArrowIcon icon={nested ? "arrowRight" : "arrowDown"} open={open} size={15} />
//         </InputWrapper>
//       </Popover.Trigger>
//       <PickerWrapper attachToRoot>
//         {items?.map(({ text: value, linkTo, breakpoint, icon, onClick, items }, index) => (
//           <Fragment key={index}>
//             {breakpoint ? (
//               <Spacer />
//             ) : items ? (
//               <Option size="body" onClick={onClick}>
//                 {icon && <StyledIcon icon={icon} size={20} />}
//                 <Menu label={value} items={items} nested />
//               </Option>
//             ) : linkTo ? (
//               <StyledLinkButton to={linkTo}>
//                 {icon && <StyledIcon icon={icon} size={20} />}
//                 {value}
//               </StyledLinkButton>
//             ) : (
//               <Option size="body" onClick={onClick}>
//                 {icon && <StyledIcon icon={icon} size={20} />}
//                 {value}
//               </Option>
//             )}
//           </Fragment>
//         ))}
//       </PickerWrapper>
//     </Popover.Provider>
//   );
// };

const HeaderProfile: React.FC<Props> = ({
  currentWorkspace = { id: undefined, name: "" },
  workspaces = [],
  onSignOut,
  onWorkspaceChange,
}) => {
  const t = useT();
  // const theme = useTheme();

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange],
  );

  const navigate = useNavigate();
  const handleAssetManager = useCallback(() => {
    if (currentWorkspace?.id) {
      navigate(`/dashboard/${currentWorkspace.id}/asset`);
    }
  }, [currentWorkspace.id, navigate]);

  const popupMenu: PopupMenuItem[] = [
    {
      icon: "switch",
      id: "switchWorkspace",
      subItem: workspaces.map(w => {
        return {
          id: w.id as string,
          title: w.name ?? t("Unknown"),
          selected: currentWorkspace.id === w.id,
          onClick: () => w.id && handleWorkspaceChange(w.id),
        };
      }),
      title: t("Switch workspace"),
    },
    {
      icon: "exit",
      id: "logOut",
      onClick: onSignOut,
      title: t("Log out"),
    },
    {
      icon: "file",
      id: "assetManagement",
      onClick: handleAssetManager,
      title: t("Asset management"),
    },
  ];

  return (
    <Option size="body">
      <PopupMenu label={currentWorkspace.name} menu={popupMenu} />
    </Option>
  );
};

// const InputWrapper = styled.div`
//   display: flex;
//   position: relative;
//   cursor: pointer;
//   align-items: center;
// `;

// const Label = styled(Text)<{}>`
//   padding: 7px 4px;
//   border-radius: 4px;
//   color: ${({ theme }) => theme.content.weak};

//   &:focus {
//     border: 1px solid ${({ theme }) => theme.select.strong};
//   }

//   &:focus-visible {
//     border: 1px solid ${({ theme }) => theme.select.strong};
//     outline: none;
//   }

//   &:hover {
//     color: ${({ theme }) => theme.content.main};
//     background: ${({ theme }) => theme.bg[2]};
//   }
// `;

// const PickerWrapper = styled(Popover.Content)`
//   min-width: 200px;
//   outline: none;
//   border-radius: 4px;
//   background: ${({ theme }) => theme.bg[0]};
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
// `;

// const Spacer = styled.div`
//   border-top: 0.5px solid ${({ theme }) => theme.outline.weak};
//   margin: 2px 0;
// `;

// const StyledLinkButton = styled(Link)`
//   text-decoration: none;
//   padding: 9px 12px;
//   font-size: 14px;
//   border-radius: 4px;
//   display: flex;
//   align-items: center;
//   gap: 5px;
//   color: ${({ theme }) => theme.content.main};
//   :hover {
//     text-decoration: none;
//     background: ${({ theme }) => theme.bg[2]};
//   }
// `;

const Option = styled(Text)`
  padding: 7px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

// const StyledIcon = styled(Icon)`
//   color: ${({ theme }) => theme.content.main};
// `;
export default HeaderProfile;

import {
  IconButton,
  IconName,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode, useCallback, MouseEvent } from "react";

import { Tabs } from "../type";

type NodeAction = {
  id: Tabs;
  icon: IconName;
};

interface NodeSystemProps {
  title?: string;
  children: (activeTab: string) => ReactNode;
  optionsMenu?: PopupMenuItem[];
  activeTab: Tabs;
  onTabChange: (newTab: Tabs) => void;
}

const NodeSystem: FC<NodeSystemProps> = ({
  children,
  title,
  optionsMenu,
  activeTab,
  onTabChange
}) => {
  const theme = useTheme();
  const handleOptionsClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const actions: NodeAction[] = [
    { id: "value", icon: "textAa" },
    { id: "expression", icon: "bracketsCurly" },
    { id: "condition", icon: "if" }
  ];

  return (
    <Wrapper>
      <HeaderWrapper>
        <TitleWrapper>{title}</TitleWrapper>
        <Actions>
          {actions.map((action) => (
            <IconButton
              key={action.id}
              icon={action.icon}
              size="small"
              iconColor={
                activeTab === action.id
                  ? theme.content.main
                  : theme.content.weaker
              }
              appearance="simple"
              onClick={() => onTabChange(action.id)}
            />
          ))}
          {!!optionsMenu && (
            <OptionsWrapper onClick={handleOptionsClick}>
              <PopupMenu
                label={
                  <IconButton
                    icon="dotsThreeVertical"
                    size="small"
                    appearance="simple"
                  />
                }
                placement="bottom-start"
                menu={optionsMenu}
              />
            </OptionsWrapper>
          )}
        </Actions>
      </HeaderWrapper>
      <ContentWrapper active={activeTab}>{children(activeTab)}</ContentWrapper>
    </Wrapper>
  );
};

export default NodeSystem;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.radius.small,
  width: "100%",
  background: "#ffffff08",
  gap: theme.spacing.micro,
  alignItems: "flex-start",
  minHeight: 50
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${theme.spacing.smallest}px ${theme.spacing.smallest}px 0 ${theme.spacing.smallest}px`,
  width: "100%"
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0
}));

const ContentWrapper = styled("div")<{ active?: string }>(
  ({ active, theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: active === "condition" ? 0 : theme.spacing.smallest,
    width: "100%"
  })
);

import {
  IconButton,
  IconName,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import React, { FC, ReactNode, useCallback, MouseEvent } from "react";

type NodeAction = {
  key: string;
  icon: IconName;
  onClick?: () => void;
}

interface NodeSystemProps {
  title?: string;
  children: ReactNode;
  optionsMenu?: PopupMenuItem[];
}

const NodeSystem: FC<NodeSystemProps> = ({
  children,
  title,
  optionsMenu
}) => {
  const handleOptionsClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const actions: NodeAction[] = [
    {
      key: "value",
      icon: "book"
    },
    {
      key: "expression",
      icon: "bracketsCurly"
    },
    {
      key: "condition",
      icon: "if"
    }
  ];

  return (
    <Wrapper>
      <HeaderWrapper>
        <TitleWrapper>{title}</TitleWrapper>
        <Actions>
          {actions?.map((action) => (
            <IconButton
              key={action.key}
              icon={action.icon}
              size="small"
              appearance="simple"
              onClick={action.onClick}
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
      <ContentWrapper>{children}</ContentWrapper>
    </Wrapper>
  );
};

export default NodeSystem;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.small,
  borderRadius: theme.radius.small,
  width: "100%",
  background: "#ffffff08",
  gap: theme.spacing.micro,
  alignItems: "flex-start",
  minHeight: 50
}));

const HeaderWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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

const ContentWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%"
}));

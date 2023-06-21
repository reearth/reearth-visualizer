import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import Text from "@reearth/classic/components/atoms/Text";
import { metricsSizes } from "@reearth/classic/theme";
import { styled, fonts, useTheme } from "@reearth/services/theme";

export type Props = {
  children?: ReactNode;
  name: string;
  to: string;
  level?: 1 | 2 | 3;
};

const NavigationItem: React.FC<Props> = ({ name, to, level, children }) => {
  const theme = useTheme();

  return (
    <>
      <LinkItem
        to={to}
        end
        style={({ isActive }) =>
          isActive
            ? {
                background: theme.classic.main.select,
                color: theme.classic.main.strongText,
              }
            : {}
        }>
        <StyledText size="m" customColor level={level}>
          {name}
        </StyledText>
      </LinkItem>
      {children && <NavigationList>{children}</NavigationList>}
    </>
  );
};

const LinkItem = styled(NavLink)`
  display: flex;
  padding: ${metricsSizes["l"]}px ${metricsSizes["s"]}px;
  color: ${({ theme }) => theme.classic.main.text};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const StyledText = styled(Text)<{ level?: 1 | 2 | 3 }>`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: ${({ level }) =>
    level === 3 ? `${metricsSizes["3xl"]}px}` : level === 2 ? `${metricsSizes["l"]}px` : 0};
`;

const NavigationList = styled.ul`
  font-size: ${fonts.sizes["body"]}px;
  width: 100%;
  margin: 0;
  padding: 0;
`;

export default NavigationItem;

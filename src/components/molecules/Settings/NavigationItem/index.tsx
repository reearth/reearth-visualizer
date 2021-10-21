import { Link } from "@reach/router";
import React from "react";

import Text from "@reearth/components/atoms/Text";
import { styled, fonts, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
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
        getProps={({ isCurrent }) =>
          isCurrent && {
            style: { background: theme.main.select, color: theme.main.strongText },
          }
        }>
        <StyledText size="m" customColor level={level}>
          {name}
        </StyledText>
      </LinkItem>
      {children && <NavigationList>{children}</NavigationList>}
    </>
  );
};

const LinkItem = styled(Link)`
  display: flex;
  padding: ${metricsSizes["l"]}px ${metricsSizes["s"]}px;
  color: ${({ theme }) => theme.main.text};
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
  font-size: ${fonts.sizes.m}px;
  width: 100%;
  margin: 0;
  padding: 0;
`;

export default NavigationItem;

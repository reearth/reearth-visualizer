import { Link } from "@reach/router";
import React from "react";

import { styled, fonts, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  name: string;
  to: string;
};

const NavigationItem: React.FC<Props> = ({ name, to, children }) => {
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
        {name}
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

const NavigationList = styled.ul`
  padding-left: ${metricsSizes["m"]}px;
  font-size: ${fonts.sizes.m}px;
`;

export default NavigationItem;

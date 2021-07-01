import React from "react";
import { styled, fonts, useTheme } from "@reearth/theme";
import { Link } from "@reach/router";
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
            style: { background: theme.colors.functional.select, color: theme.colors.text.strong },
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
  color: ${({ theme }) => theme.colors.text.main};
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

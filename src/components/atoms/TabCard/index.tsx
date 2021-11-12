import React from "react";

import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import Flex from "../Flex";
import Box from "../Box";

export type Props = {
  className?: string;
  name?: string;
  children?: React.ReactNode;
};

const TabCard: React.FC<Props> = ({ className, name, children }) => {
  const theme = useTheme();
  return (
    <Box mb="l" className={className}>
      <Flex direction="column" align="flex-start">
        <Box bg={theme.properties.bg} pt="s" pb="s" pr="l" pl="l">
          <Text
            size="xs"
            color={theme.main.strongText}
            weight="normal"
            otherProperties={{ flex: "auto" }}>
            {name}
          </Text>
        </Box>
        <Body>{children}</Body>
      </Flex>
    </Box>
  );
};

const Body = styled.div`
  width: calc(100% - 32px);
  background-color: ${props => props.theme.properties.bg};
  padding: 16px;
`;

export default TabCard;

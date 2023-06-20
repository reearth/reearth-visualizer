import { ReactNode } from "react";

import Text from "@reearth/classic/components/atoms/Text";
import { styled, useTheme } from "@reearth/services/theme";

import Box from "../Box";
import Flex from "../Flex";

export type Props = {
  className?: string;
  children?: ReactNode;
  name?: string;
};

const TabCard: React.FC<Props> = ({ className, name, children }) => {
  const theme = useTheme();
  return (
    <Box mb="l" className={className}>
      <Flex direction="column" align="flex-start">
        <Box bg={theme.classic.properties.bg} pt="s" pb="s" pr="l" pl="l">
          <Text
            size="xs"
            color={theme.classic.main.strongText}
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
  background-color: ${props => props.theme.classic.properties.bg};
  padding: 16px;
`;

export default TabCard;

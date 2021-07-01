import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import SearchBar from "@reearth/components/atoms/SearchBar";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import React from "react";
import { useIntl } from "react-intl";
import { PluginPageMode } from "..";
import PluginAccordion from "../../PluginAccordion";

export type Props = {
  className?: string;
  plugins?: any[]; //FIXME: When back-end API is readly
  onMoveNextPage?: (mode: PluginPageMode) => void;
};

const PluginList: React.FC<Props> = ({ className, plugins, onMoveNextPage }) => {
  const intl = useIntl();
  const theme = useTheme();
  return (
    <Flex direction="column" className={className}>
      <Flex className="plugin-subheader" justify="space-between">
        <SearchBar placeHolder="Search plug-ins" />
        <StyledFlex align="center" onClick={() => onMoveNextPage?.("install-way")}>
          <Box mh="m">
            <Text weight="bold" size="m">
              {intl.formatMessage({ defaultMessage: "Advanced options" })}
            </Text>
          </Box>
          <Icon icon="arrowLongRight" size={20} color={theme.colors.text.main} />
        </StyledFlex>
      </Flex>
      <PluginAccordion items={plugins} />
    </Flex>
  );
};

const StyledFlex = styled(Flex)`
  cursor: pointer;
`;

export default PluginList;

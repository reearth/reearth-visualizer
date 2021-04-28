import Box from "@reearth/components/atoms/Box";
import Markdown from "@reearth/components/atoms/Markdown";
import { useTheme } from "@reearth/theme";
import React from "react";

export type Props = {
  children?: string;
};

const PluginAccordionItemBody: React.FC<Props> = ({ children }) => {
  const theme = useTheme();
  const markdownTypographyStyle = {
    color: theme.text.default,
  };
  return (
    <Box ph="2xl">
      <Markdown backgroundColor={theme.pluginList.bg} styles={markdownTypographyStyle}>
        {children}
      </Markdown>
    </Box>
  );
};

export default PluginAccordionItemBody;

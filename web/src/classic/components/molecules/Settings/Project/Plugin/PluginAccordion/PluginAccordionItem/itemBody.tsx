import { useTheme } from "@reearth/beta/services/theme";
import Box from "@reearth/classic/components/atoms/Box";
import Markdown from "@reearth/classic/components/atoms/Markdown";

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

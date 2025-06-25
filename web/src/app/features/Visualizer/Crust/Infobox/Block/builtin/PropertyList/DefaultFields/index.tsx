import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import JsonView from "react18-json-view";

import ListItem from "../ListItem";

type Props = {
  properties?: any[];
  isEditable?: boolean;
};

const DefaultFields: React.FC<Props> = ({ properties, isEditable }) => {
  const theme = useTheme();
  return (
    <>
      {properties?.map((field, idx) => {
        const [key, value]: [string, any] = Object.entries(field)[0];
        if (value && typeof value === "object") {
          return (
            <ObjectWrapper key={key}>
              <Typography size="body" color={theme.content.weaker}>
                {key}
              </Typography>
              <JsonView
                src={value}
                theme="a11y"
                collapsed={!!isEditable}
                style={{
                  wordWrap: "break-word",
                  minWidth: 0,
                  lineHeight: "1.5em",
                  fontSize: theme.fonts.sizes.body
                }}
              />
            </ObjectWrapper>
          );
        }
        return <ListItem key={key} index={idx} keyValue={key} value={value} />;
      })}
    </>
  );
};

export default DefaultFields;

const ObjectWrapper = styled("div")(() => ({}));

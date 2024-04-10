import JsonView from "react18-json-view";

import { styled } from "@reearth/services/theme";

import ListItem from "../ListItem";

type Props = {
  properties?: any[];
  isEditable?: boolean;
};

const DefaultFields: React.FC<Props> = ({ properties, isEditable }) => {
  return (
    <>
      {properties?.map((field, idx) => {
        const [key, value]: [string, any] = Object.entries(field)[0];
        if (value && typeof value === "object") {
          return (
            <ObjectWrapper key={key}>
              <JsonView
                src={value}
                theme="a11y"
                collapsed={!!isEditable}
                style={{ wordWrap: "break-word", minWidth: 0, lineHeight: "1.5em" }}
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

const ObjectWrapper = styled.div`
  margin-top: 8px;
`;

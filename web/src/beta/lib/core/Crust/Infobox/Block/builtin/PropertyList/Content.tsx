import { memo, useContext } from "react";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import { BlockContext } from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import Template from "@reearth/beta/lib/core/StoryPanel/Block/Template";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../../../types";

import CustomFields from "./CustomFields";
import DefaultFields from "./DefaultFields";
import ListEditor, { DisplayTypeField, PropertyListField } from "./ListEditor";

type Props = {
  block?: InfoboxBlock;
  isEditable?: boolean;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const Content: React.FC<Props> = ({ block, isEditable, ...props }) => {
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();

  const displayTypeField: DisplayTypeField = block?.property?.default?.displayType;

  const propertyListField: PropertyListField =
    displayTypeField?.value === "custom" && block?.property?.default?.propertyList;

  // properties needs to be re-rendered each time to have correct values from the viz ref
  const properties = () => {
    if (displayTypeField.value === "custom") {
      return propertyListField.value;
    } else if (displayTypeField.value === "rootOnly") {
      return filterTypeFrom(visualizer.current?.layers.selectedFeature()?.properties, "object");
    } else {
      return filterChildObjectsToEnd(visualizer.current?.layers.selectedFeature()?.properties);
    }
  };

  return (
    <Wrapper>
      {!context?.editMode ? (
        displayTypeField.value === "custom" ? (
          properties ? (
            <CustomFields properties={properties()} extensionId={block?.extensionId} />
          ) : (
            <Template icon={block?.extensionId} height={120} />
          )
        ) : (
          <DefaultFields properties={properties()} isEditable={isEditable} />
        )
      ) : (
        <Template icon={block?.extensionId} height={120} />
      )}
      {context?.editMode && (
        <ListEditor
          propertyId={block?.propertyId}
          displayTypeField={displayTypeField}
          propertyListField={propertyListField}
          {...props}
        />
      )}
    </Wrapper>
  );
};

export default memo(Content);

const Wrapper = styled.div`
  width: 100%;
`;

function filterChildObjectsToEnd(inputObject?: any): any[] {
  if (!inputObject) return [];
  const arrayResult: any[] = [];
  const childObjects: [string, any][] = [];

  for (const key in inputObject) {
    if (typeof inputObject[key] === "object" && inputObject[key] !== null) {
      childObjects.push([key, inputObject[key]]);
    } else {
      arrayResult.push({ [key]: inputObject[key] });
    }
  }

  childObjects.forEach(([key, value]) => {
    arrayResult.push({ [key]: value });
  });

  return arrayResult;
}

function filterTypeFrom(inputObject?: any, type?: string): any[] {
  if (!type) return inputObject;
  if (!inputObject) return [];

  const arrayResult: any[] = [];

  for (const key in inputObject) {
    if (typeof inputObject[key] !== type) {
      arrayResult.push({ [key]: inputObject[key] });
    }
  }

  return arrayResult;
}

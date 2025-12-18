import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import Template from "@reearth/app/features/Visualizer/Crust/StoryPanel/Block/Template";
import { BlockContext } from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { coreContext } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, memo, useContext, useMemo } from "react";

import { InfoboxBlock } from "../../../types";

import CustomFields from "./CustomFields";
import DefaultFields from "./DefaultFields";
import ListEditor, {
  DisplayTypeField,
  PropertyListField,
  PropertyListItem
} from "./ListEditor";

type Props = {
  block?: InfoboxBlock;
  isEditable?: boolean;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
};

const Content: FC<Props> = ({ block, isEditable, ...props }) => {
  const context = useContext(BlockContext);

  const { selectedComputedFeature } = useContext(coreContext as React.Context<any>);

  const displayTypeField: DisplayTypeField =
    block?.property?.default?.displayType;

  const propertyListField: PropertyListField =
    displayTypeField?.value === "custom" &&
    block?.property?.default?.propertyList;

  const properties = useMemo(() => {
    if (displayTypeField?.value === "custom") {
      return propertyListField.value;
    } else if (displayTypeField?.value === "rootOnly") {
      return filterTypeFrom(selectedComputedFeature?.properties, "object");
    } else {
      return filterChildObjectsToEnd(selectedComputedFeature?.properties);
    }
  }, [
    displayTypeField,
    propertyListField,
    selectedComputedFeature?.properties
  ]);

  return (
    <Wrapper>
      {!context?.editMode ? (
        displayTypeField?.value === "custom" ? (
          properties ? (
            <CustomFields
              selectedFeature={selectedComputedFeature}
              properties={properties as PropertyListItem[]}
              extensionId={block?.extensionId}
            />
          ) : (
            <Template icon={block?.extensionId} height={120} />
          )
        ) : (
          <DefaultFields
            properties={properties as Record<string, unknown>[]}
            isEditable={isEditable}
          />
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

const Wrapper = styled("div")(() => ({
  width: "100%"
}));

function filterChildObjectsToEnd(
  inputObject?: Record<string, unknown>
): unknown[] {
  if (!inputObject) return [];
  const arrayResult: unknown[] = [];
  const childObjects: [string, unknown][] = [];

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

function filterTypeFrom(
  inputObject?: Record<string, unknown>,
  type?: string
): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!type) return inputObject as any;
  if (!inputObject) return [];

  const arrayResult: unknown[] = [];

  for (const key in inputObject) {
    if (typeof inputObject[key] !== type) {
      arrayResult.push({ [key]: inputObject[key] });
    }
  }

  return arrayResult;
}

import { memo, useContext } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import Text from "@reearth/beta/components/Text";
import { BlockContext } from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../../../types";

import ListEditor from "./ListEditor";
// import { ComputedFeature } from "@reearth/beta/lib/core/mantle";

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

const Content: React.FC<Props> = ({ block, isEditable }) => {
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();

  const properties = filterChildObjectsToEnd(
    visualizer.current?.layers.selectedFeature()?.properties,
  );

  return (
    <Wrapper>
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
        return (
          <PropertyWrapper key={idx} isEven={isEven(idx)}>
            <TextWrapper>
              <StyledText size="body" customColor otherProperties={{ userSelect: "auto" }}>
                {key}
              </StyledText>
            </TextWrapper>
            <TextWrapper>
              <StyledText size="body" customColor otherProperties={{ userSelect: "auto" }}>
                {value}
              </StyledText>
            </TextWrapper>
          </PropertyWrapper>
        );
      })}
      {context?.editMode && (
        <ListEditor propertyId={block?.propertyId} property={block?.property?.default} />
      )}
    </Wrapper>
  );
};

export default memo(Content);

const Wrapper = styled.div`
  width: 100%;
`;

const PropertyWrapper = styled.div<{ isEven?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: ${({ isEven }) => isEven && "#F4F4F4"};
  padding: 8px 16px;
  box-sizing: border-box;
  width: 100%;
`;

const TextWrapper = styled.div`
  flex: 1;
`;

const ObjectWrapper = styled.div`
  margin-top: 8px;
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.content.weaker};
`;

function isEven(number: number) {
  return !!(number % 2 === 0);
}

function filterChildObjectsToEnd(inputObject?: any): any[] {
  if (!inputObject) return [];
  const arrayResult: any[] = [];
  const childObjects: [string, any][] = [];

  // Iterate over the properties of the input object
  for (const key in inputObject) {
    if (typeof inputObject[key] === "object" && inputObject[key] !== null) {
      // If the property value is an object, store it to process later
      childObjects.push([key, inputObject[key]]);
    } else {
      // If it's not an object, push it to the result array
      arrayResult.push({ [key]: inputObject[key] });
    }
  }

  // Push child objects to the end of the result array
  childObjects.forEach(([key, value]) => {
    arrayResult.push({ [key]: value });
  });

  return arrayResult;
}

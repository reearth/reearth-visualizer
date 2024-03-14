import { memo, useContext } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import Text from "@reearth/beta/components/Text";
import { BlockContext } from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import Template from "@reearth/beta/lib/core/StoryPanel/Block/Template";
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

const Content: React.FC<Props> = ({ block, isEditable, ...props }) => {
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();

  const properties = filterChildObjectsToEnd(
    visualizer.current?.layers.selectedFeature()?.properties,
  );

  return (
    <Wrapper>
      {!isEditable ? (
        properties?.map((field, idx) => {
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
        })
      ) : (
        <Template icon={block?.extensionId} height={120} />
      )}
      {context?.editMode && (
        <ListEditor propertyId={block?.propertyId} property={block?.property?.default} {...props} />
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

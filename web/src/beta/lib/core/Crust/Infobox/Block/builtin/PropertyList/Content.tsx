import { useContext } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

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

const Content: React.FC<Props> = ({ block }) => {
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();

  if (visualizer?.current?.layers.selectedFeature()?.properties) {
    console.log("SELECTED FEATURE1111", visualizer?.current?.layers.selectedFeature()?.properties);
    // Object.values(visualizer?.current?.layers.selectedFeature()?.properties)?.map(p => {
    //   console.log("P:", p);
    // });
  }

  return (
    <Wrapper>
      {visualizer?.current?.layers.selectedFeature()?.properties &&
        Object.keys(visualizer.current.layers.selectedFeature()?.properties)?.map((p, idx) => {
          const field = visualizer?.current?.layers.selectedFeature()?.properties[p];
          if (field && typeof field === "object") {
            return (
              <ObjectWrapper key={p}>
                <JsonView src={field} theme="a11y" />
              </ObjectWrapper>
            );
          }
          return (
            <PropertyWrapper key={p} isEven={isEven(idx)}>
              <p>{p}</p>
              <p>{visualizer?.current?.layers.selectedFeature()?.properties[p]}</p>
            </PropertyWrapper>
          );
        })}
      {context?.editMode && (
        <ListEditor propertyId={block?.propertyId} property={block?.property?.default} />
      )}
    </Wrapper>
  );
};

export default Content;

const Wrapper = styled.div`
  width: 100%;
`;

const PropertyWrapper = styled.div<{ isEven?: boolean }>`
  display: flex;
  justify-content: space-between;
  background: ${({ isEven }) => isEven && "#F4F4F4"};
  padding: 8px 16px;
  box-sizing: border-box;
  width: 100%;
`;

const ObjectWrapper = styled.div`
  margin-top: 8px;
`;

function isEven(number: number) {
  return !!(number % 2 === 0);
}

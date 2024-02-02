import { useContext } from "react";

import { BlockContext } from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../../../types";

import ListEditor from "./ListEditor";

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

  return (
    <Wrapper>
      {block?.name}
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

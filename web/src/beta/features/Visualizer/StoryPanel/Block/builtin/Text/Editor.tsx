import { debounce } from "lodash-es";
import { useMemo, useContext, useCallback } from "react";

import RichTextEditor from "@reearth/beta/lib/lexical/RichTextEditor";

import { BlockContext } from "../../../../shared/components/BlockWrapper";

export type Props = {
  text?: string;
  propertyId?: string;
  isEditable?: boolean;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
};

const TextBlockEditor: React.FC<Props> = ({ text, propertyId, isEditable, onPropertyUpdate }) => {
  const context = useContext(BlockContext);

  const handlePropertyValueUpdate = useCallback(
    (schemaGroupId: string, propertyId: string, fieldId: string, vt: any, itemId?: string) => {
      return async (v?: any) => {
        await onPropertyUpdate?.(propertyId, schemaGroupId, fieldId, itemId, vt, v);
      };
    },
    [onPropertyUpdate],
  );

  const handleTextUpdate = useCallback(
    (text: string) => {
      if (!propertyId || !isEditable) return;
      handlePropertyValueUpdate("default", propertyId, "text", "string")(text);
    },
    [propertyId, isEditable, handlePropertyValueUpdate],
  );

  const debouncedHandleTextUpdate = useMemo(
    () => (handleTextUpdate ? debounce(handleTextUpdate, 1000) : undefined),
    [handleTextUpdate],
  );

  return (
    <RichTextEditor
      editMode={!!context?.editMode}
      text={text}
      onChange={debouncedHandleTextUpdate}
      scrollableContainerId="story-page"
    />
  );
};

export default TextBlockEditor;

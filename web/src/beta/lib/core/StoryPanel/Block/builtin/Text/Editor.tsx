import { debounce } from "lodash-es";
import { useMemo, useContext } from "react";

import RichTextEditor from "@reearth/beta/lib/lexical/RichTextEditor";

import { BlockContext } from "../common/Wrapper";

export type Props = {
  text?: string;
  onUpdate?: (text: string) => void;
};

const TextBlockEditor: React.FC<Props> = ({ text, onUpdate }) => {
  const debouncedHandleTextUpdate = useMemo(
    () => (onUpdate ? debounce(onUpdate, 1000) : undefined),
    [onUpdate],
  );

  const context = useContext(BlockContext);

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

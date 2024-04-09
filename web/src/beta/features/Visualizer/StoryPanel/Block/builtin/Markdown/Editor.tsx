import { debounce } from "lodash-es";
import { useContext, useCallback, useLayoutEffect, useRef, useMemo, useState } from "react";

import Markdown from "@reearth/beta/components/Markdown";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { BlockContext } from "../../../../shared/components/BlockWrapper";

export type Props = {
  text: string;
  onUpdate: (text: string) => void;
};

const MdBlockEditor: React.FC<Props> = ({ text, onUpdate }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useT();
  const context = useContext(BlockContext);

  const [value, setValue] = useState(text);

  const debouncedHandleTextUpdate = useMemo(() => debounce(onUpdate, 1000), [onUpdate]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.currentTarget.value);
      debouncedHandleTextUpdate(e.currentTarget.value);
    },
    [debouncedHandleTextUpdate],
  );

  useLayoutEffect(() => {
    if (!textareaRef?.current) return;
    // Reset height - important to shrink on delete
    textareaRef.current.style.height = "inherit";
    // Set height
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value, context?.editMode]);

  return context?.editMode ? (
    <StyledTextArea
      ref={textareaRef}
      placeholder={t("Add markdown text here")}
      value={value}
      onChange={onChange}
    />
  ) : (
    <StyledMarkdown empty={!value}>{value || t("Add markdown text here")}</StyledMarkdown>
  );
};

const StyledTextArea = styled.textarea`
  width: 100%;
  resize: none;
  overflow: hidden;
  ${({ value }) => !value && "min-height: 115px;"}
  border: none;
  font-size: 14px;
  padding: 0px;
  outline: none;
`;

const StyledMarkdown = styled(Markdown)<{ empty: boolean }>`
  ${({ empty }) => empty && "min-height: 115px;"}
  font-size: 14px;
  opacity: ${({ empty }) => (!empty ? 1 : 0.6)};
`;

export default MdBlockEditor;

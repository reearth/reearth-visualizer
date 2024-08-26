import { BlockContext } from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { Markdown } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { debounce } from "lodash-es";
import {
  useContext,
  useCallback,
  useLayoutEffect,
  useRef,
  useMemo,
  useState,
  FC,
} from "react";

export type Props = {
  text: string;
  onUpdate: (text: string) => void;
};

const MdBlockEditor: FC<Props> = ({ text, onUpdate }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useT();
  const context = useContext(BlockContext);

  const [value, setValue] = useState(text);

  const debouncedHandleTextUpdate = useMemo(
    () => debounce(onUpdate, 1000),
    [onUpdate],
  );

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
      placeholder={t("Add markdown text here")}
      value={value}
      onChange={onChange}
    />
  ) : (
    <StyledMarkdown empty={!value}>
      {value || t("Add markdown text here")}
    </StyledMarkdown>
  );
};

const StyledTextArea = styled("textarea")(() => ({
  width: "100%",
  resize: "none",
  overflow: "hidden",
  minHeight: "115px",
  border: "none",
  fontSize: "14px",
  padding: 0,
  outline: "none",
}));

const StyledMarkdown = styled(Markdown)<{ empty: boolean }>(({ empty }) => ({
  minHeight: empty ? "115px" : "0",
  fontSize: "14px",
  opacity: !empty ? 1 : 0.6,
}));

export default MdBlockEditor;

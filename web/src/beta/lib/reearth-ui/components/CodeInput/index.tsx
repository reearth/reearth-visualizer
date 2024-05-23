import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { FC, useMemo, useRef, useCallback, useState, useEffect } from "react";

import { fonts, styled, useTheme } from "@reearth/services/theme";

export type CodeInputProps = {
  value?: string;
  language?: string;
  showLines?: boolean;
  disabled?: boolean;
  onChange?: (val: string | undefined) => void;
  onBlur?: (val: string | undefined) => void;
};

export const CodeInput: FC<CodeInputProps> = ({
  value,
  language = "json",
  showLines = true,
  disabled,
  onChange,
  onBlur,
}) => {
  const theme = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const currentValue = useRef<string | undefined>(value);
  const [isActive, setIsActive] = useState<boolean>(false);

  const options = useMemo(
    () => ({
      bracketPairColorization: {
        enabled: true,
      },
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      selectOnLineNumbers: true,
      fontSize: fonts.sizes.body,
      lineNumbers: showLines ? "on" : "off",
      readOnly: disabled ? true : false,
      wordWrap: "on",
      readOnlyMessage: {
        supportHtml: false,
      },
    }),
    [disabled, showLines],
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": theme.bg[1],
      },
    });
    monaco.editor.setTheme("myCustomTheme");

    editor.onDidBlurEditorText(() => {
      setIsActive(false);
      onBlur?.(currentValue.current);
    });

    editor.onDidFocusEditorWidget(() => {
      setIsActive(true);
    });
  };

  const handleChange = useCallback(
    (val: string | undefined) => {
      currentValue.current = val;
      onChange?.(val);
    },
    [onChange],
  );

  useEffect(() => {
    currentValue.current = value;
  }, [value]);

  return (
    <EditorWrapper isActive={isActive} disabled={disabled}>
      <MonacoEditor
        language={language}
        theme="vs-dark"
        options={options}
        defaultValue={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
      />
    </EditorWrapper>
  );
};

const EditorWrapper = styled("div")<{
  isActive?: boolean;
  disabled?: boolean;
}>(({ theme, isActive, disabled }) => ({
  width: "100%",
  height: "100%",
  overflow: "hidden",
  border: disabled
    ? `1px solid ${theme.outline.weak}`
    : isActive
    ? `1px solid ${theme.select.strong}`
    : `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  cursor: disabled ? "not-allowed" : "text",
  boxShadow: theme.shadow.input,
  ".monaco-editor .view-lines": {
    cursor: disabled ? "not-allowed !important" : "text",
  },
}));

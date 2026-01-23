import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { useT } from "@reearth/services/i18n/hooks";
import { fonts, styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo, useCallback, useState, useEffect } from "react";

export type CodeInputProps = {
  value?: string;
  language?: string;
  showLines?: boolean;
  disabled?: boolean;
  height?: number;
  onChange?: (val: string | undefined) => void;
  onBlur?: (val: string | undefined) => void;
  onMount?: OnMount;
  dataTestid?: string;
};

export const CodeInput: FC<CodeInputProps> = ({
  value,
  language = "json",
  showLines = true,
  disabled,
  height,
  onChange,
  onBlur,
  onMount,
  dataTestid
}) => {
  const theme = useTheme();
  const t = useT();
  const [currentValue, setCurrentValue] = useState<string | undefined>(value);
  const [isActive, setIsActive] = useState<boolean>(false);

  const options = useMemo(
    () => ({
      bracketPairColorization: {
        enabled: true
      },
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      selectOnLineNumbers: true,
      fontSize: fonts.sizes.body,
      fontFamily: fonts.fontFamilies.code,
      lineNumbers: showLines ? "on" : "off",
      readOnly: disabled ? true : false,
      wordWrap: "on",
      readOnlyMessage: {
        supportHtml: false
      },
      scrollbar: {
        horizontal: "hidden"
      },
      tabSize: 2
    }),
    [disabled, showLines]
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": theme.bg[1]
      }
    });

    monaco.editor.setTheme("myCustomTheme");
    editor.getAction("editor.action.formatDocument").run();

    editor.onDidBlurEditorText(() => {
      setIsActive(false);
      onBlur?.(currentValue);
    });

    editor.onDidFocusEditorWidget(() => {
      setIsActive(true);
    });

    onMount?.(editor, monaco);
  };

  const handleChange = useCallback(
    (val: string | undefined) => {
      setCurrentValue(val);
      onChange?.(val);
    },
    [onChange]
  );

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <EditorWrapper
      isActive={isActive}
      disabled={disabled}
      data-testid={dataTestid}
    >
      <MonacoEditor
        language={language}
        theme="vs-dark"
        options={options}
        value={value}
        height={height}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={<>{t("Loading...")}</>}
      />
    </EditorWrapper>
  );
};

const EditorWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "isActive"
})<{
  isActive?: boolean;
  disabled?: boolean;
}>(({ theme, isActive, disabled }) => ({
  width: "100%",
  height: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
  border: disabled
    ? `1px solid ${theme.outline.weak}`
    : isActive
      ? `1px solid ${theme.select.strong}`
      : `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  cursor: disabled ? "not-allowed" : "text",
  boxShadow: theme.shadow.input,
  ".monaco-editor .view-lines": {
    cursor: disabled ? "not-allowed !important" : "text"
  }
}));

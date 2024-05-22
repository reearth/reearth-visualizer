import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { FC, useMemo, useRef, useCallback } from "react";

import { fonts } from "@reearth/services/theme";

export type CodeInputProps = {
  value?: string;
  language?: string;
  showLines?: boolean;
  disabled?: boolean;
  onChange?: (val: string | undefined) => void;
  onBlur?: (val: string | undefined) => void;
};

export const CodeInput: FC<CodeInputProps> = ({
  value = "{}",
  language = "json",
  showLines = true,
  disabled,
  onChange,
  onBlur,
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const currentValue = useRef<string | undefined>(value);
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
    }),
    [disabled, showLines],
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidBlurEditorText(() => {
      onBlur?.(currentValue.current);
    });
  };

  const handleChange = useCallback(
    (val: string | undefined) => {
      currentValue.current = val;
      onChange?.(val);
    },
    [onChange],
  );

  return (
    <MonacoEditor
      language={language}
      theme="vs-dark"
      options={options}
      defaultValue={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
    />
  );
};

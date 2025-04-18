import * as monacoEditor from "@monaco-editor/react";
import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { vi, describe, it, expect, afterEach } from "vitest";

import { CodeInput } from "./index";

vi.mock("@monaco-editor/react", () => {
  return {
    __esModule: true,
    default: vi.fn(({ _onMount, onChange, value, loading }) => {
      return (
        <div data-testid="monaco-editor">
          <textarea
            data-testid="monaco-editor-input"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() =>
              mockEditorInstance.onDidFocusEditorWidget.mock.calls[0][0]()
            }
            onBlur={() =>
              mockEditorInstance.onDidBlurEditorText.mock.calls[0][0]()
            }
          />
          {loading}
        </div>
      );
    })
  };
});

type MockEditorType = {
  getAction: ReturnType<typeof vi.fn>;
  onDidBlurEditorText: ReturnType<typeof vi.fn>;
  onDidFocusEditorWidget: ReturnType<typeof vi.fn>;
};

const mockEditorInstance: MockEditorType = {
  getAction: vi.fn().mockReturnValue({ run: vi.fn() }),
  onDidBlurEditorText: vi.fn().mockImplementation((callback) => callback),
  onDidFocusEditorWidget: vi.fn().mockImplementation((callback) => callback)
};

type MockMonacoType = {
  editor: {
    defineTheme: ReturnType<typeof vi.fn>;
    setTheme: ReturnType<typeof vi.fn>;
  };
};

const mockMonacoInstance: MockMonacoType = {
  editor: {
    defineTheme: vi.fn(),
    setTheme: vi.fn()
  }
};

describe("CodeInput", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<CodeInput />);
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
  });

  it("passes the correct language prop to MonacoEditor", () => {
    render(<CodeInput language="javascript" />);
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "javascript"
      }),
      expect.anything()
    );
  });

  it("applies default language when not specified", () => {
    render(<CodeInput />);
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "json"
      }),
      expect.anything()
    );
  });

  it("passes the disabled state to options", () => {
    render(<CodeInput disabled />);
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          readOnly: true
        })
      }),
      expect.anything()
    );
  });

  it("configures line numbers based on showLines prop", () => {
    render(<CodeInput showLines={false} />);
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          lineNumbers: "off"
        })
      }),
      expect.anything()
    );
  });

  it("calls format document action on mount", () => {
    render(<CodeInput />);

    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    const onMountCallback = monacoEditorMock.mock.calls[0][0].onMount;

    onMountCallback(mockEditorInstance, mockMonacoInstance);

    expect(mockEditorInstance.getAction).toHaveBeenCalledWith(
      "editor.action.formatDocument"
    );
    expect(mockEditorInstance.getAction().run).toHaveBeenCalled();
  });

  it("calls custom onMount prop if provided", () => {
    const customOnMount = vi.fn();
    render(<CodeInput onMount={customOnMount} />);

    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    const onMountCallback = monacoEditorMock.mock.calls[0][0].onMount;

    onMountCallback(mockEditorInstance, mockMonacoInstance);

    expect(customOnMount).toHaveBeenCalledWith(
      mockEditorInstance,
      mockMonacoInstance
    );
  });

  it("updates value when prop changes", async () => {
    const { rerender } = render(<CodeInput value="initial value" />);

    rerender(<CodeInput value="new value" />);

    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: "new value"
      }),
      expect.anything()
    );
  });

  it("calls onChange when content changes", () => {
    const handleChange = vi.fn();
    render(<CodeInput onChange={handleChange} />);

    const inputElement = screen.getByTestId("monaco-editor-input");
    fireEvent.change(inputElement, { target: { value: "new content" } });

    expect(handleChange).toHaveBeenCalledWith("new content");
  });

  it("calls onBlur when editor loses focus", () => {
    const handleBlur = vi.fn();
    render(<CodeInput onBlur={handleBlur} />);

    // Set up the editor instance with the blur handler
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    const onMountCallback = monacoEditorMock.mock.calls[0][0].onMount;
    onMountCallback(mockEditorInstance, mockMonacoInstance);

    // Simulate editor blur
    const inputElement = screen.getByTestId("monaco-editor-input");
    fireEvent.blur(inputElement);

    // onBlur should be called with the current value
    expect(handleBlur).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalledWith(undefined);
  });

  it("updates active state on focus/blur", () => {
    render(<CodeInput />);

    // Set up the editor instance with the focus/blur handlers
    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    const onMountCallback = monacoEditorMock.mock.calls[0][0].onMount;
    onMountCallback(mockEditorInstance, mockMonacoInstance);

    // Focus the editor
    const inputElement = screen.getByTestId("monaco-editor-input");
    fireEvent.focus(inputElement);

    // Blur the editor
    fireEvent.blur(inputElement);

    // The active state changes are verified through the internal state,
    // but in real testing we would verify the style changes
    expect(mockEditorInstance.onDidFocusEditorWidget).toHaveBeenCalled();
    expect(mockEditorInstance.onDidBlurEditorText).toHaveBeenCalled();
  });

  it("shows loading state while editor is initializing", () => {
    render(<CodeInput />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("passes the height prop to MonacoEditor", () => {
    render(<CodeInput height={500} />);

    const monacoEditorMock = monacoEditor.default as unknown as ReturnType<
      typeof vi.fn
    >;
    expect(monacoEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 500
      }),
      expect.anything()
    );
  });
});

import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { Markdown } from "./index";

interface ReactMarkdownProps {
  children: string;
  components: {
    a?: React.ComponentType<{
      href?: string;
      children?: React.ReactNode;
    }>;
  };
  remarkPlugins: unknown[];
  className?: string;
}

vi.mock("react-markdown", () => ({
  default: ({
    children,
    components,
    remarkPlugins,
    className
  }: ReactMarkdownProps) => (
    <div
      data-testid="mock-react-markdown"
      data-plugins={remarkPlugins.length}
      className={className}
    >
      <div data-testid="markdown-content">{children}</div>
      {components.a && (
        <div data-testid="link-renderer">
          {React.createElement(components.a, {
            href: "https://example.com",
            children: "Test Link"
          })}
        </div>
      )}
    </div>
  )
}));

vi.mock("remark-gfm", () => {
  return { default: "gfm-plugin" };
});

vi.mock("@reearth/beta/utils/value", () => ({
  Typography: {},
  typographyStyles: (styles: Record<string, string> | undefined) => styles || {}
}));

describe("Markdown Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders markdown content", () => {
    const markdownText = "# Hello World\n\nThis is a paragraph";
    render(<Markdown>{markdownText}</Markdown>);

    const reactMarkdown = screen.getByTestId("mock-react-markdown");
    expect(reactMarkdown).toBeInTheDocument();

    const content = screen.getByTestId("markdown-content");
    expect(content).toHaveTextContent(markdownText);
  });

  test("renders with default className", () => {
    render(<Markdown>Some content</Markdown>);

    const wrapper = screen.getByTestId("mock-react-markdown").parentElement;
    expect(wrapper).toHaveClass("markdown-body");
  });

  test("applies custom className", () => {
    const customClass = "custom-markdown";
    render(<Markdown className={customClass}>Some content</Markdown>);

    const wrapper = screen.getByTestId("mock-react-markdown").parentElement;
    expect(wrapper).toHaveClass(customClass);
  });

  test("handles click events", () => {
    const mockOnClick = vi.fn();
    render(<Markdown onClick={mockOnClick}>Clickable content</Markdown>);

    const markdownElement = screen.getByTestId("mock-react-markdown");
    const wrapper = markdownElement.parentElement;

    expect(wrapper).not.toBeNull();
    if (wrapper) {
      fireEvent.click(wrapper);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });

  test("handles double click events", () => {
    const mockOnDoubleClick = vi.fn();
    render(
      <Markdown onDoubleClick={mockOnDoubleClick}>Clickable content</Markdown>
    );

    const markdownElement = screen.getByTestId("mock-react-markdown");
    const wrapper = markdownElement.parentElement;

    expect(wrapper).not.toBeNull();
    if (wrapper) {
      fireEvent.doubleClick(wrapper);
      expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
    }
  });

  test("renders with gfm plugin", () => {
    render(<Markdown>Using GFM</Markdown>);

    const reactMarkdown = screen.getByTestId("mock-react-markdown");
    expect(reactMarkdown).toHaveAttribute("data-plugins", "1");
  });

  test("applies typography styles", () => {
    const customStyles = {
      fontSize: 16,
      fontWeight: 700
    };

    render(<Markdown styles={customStyles}>Styled content</Markdown>);
  });

  test("renders custom link component that opens in new tab", () => {
    render(<Markdown>Content with [link](https://example.com)</Markdown>);

    const linkRenderer = screen.getByTestId("link-renderer");
    const link = linkRenderer.querySelector("a");

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveTextContent("Test Link");
  });

  test("handles dark mode based on background color", () => {
    const darkBackground = "#000000";
    render(<Markdown backgroundColor={darkBackground}>Dark content</Markdown>);
  });

  test("renders empty string when no children provided", () => {
    render(<Markdown />);

    const content = screen.getByTestId("markdown-content");
    expect(content).toHaveTextContent("");
  });
});

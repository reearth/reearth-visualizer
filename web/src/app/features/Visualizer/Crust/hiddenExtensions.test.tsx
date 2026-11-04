import { render } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { hiddenExtensionKey } from "./hiddenExtensionKey";
import {
  HiddenExtensionsProvider,
  HideableExtension
} from "./hiddenExtensions";

const Probe = ({
  onMount,
  onUnmount
}: {
  onMount: () => void;
  onUnmount: () => void;
}) => {
  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);
  return <span>plugin</span>;
};

describe("HideableExtension", () => {
  it("adds no element without a provider", () => {
    const { container } = render(
      <HideableExtension pluginId="p" extensionId="e">
        <span>plugin</span>
      </HideableExtension>
    );
    expect(container.innerHTML).toBe("<span>plugin</span>");
  });

  it("hides by styling and keeps the child mounted, through hide and show", () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const ui = (hidden: string[]) => (
      <HiddenExtensionsProvider value={hidden}>
        <HideableExtension pluginId="p" extensionId="e">
          <Probe onMount={onMount} onUnmount={onUnmount} />
        </HideableExtension>
      </HiddenExtensionsProvider>
    );
    const key = hiddenExtensionKey("p", "e");
    const { container, rerender } = render(ui([]));
    const wrapper = () => container.firstElementChild as HTMLElement;
    expect(wrapper().style.display).toBe("contents");

    for (let i = 0; i < 3; i++) {
      rerender(ui([key]));
      expect(wrapper().style.display).toBe("none");
      rerender(ui([]));
      expect(wrapper().style.display).toBe("contents");
    }

    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("hides only the matching extension", () => {
    const { container } = render(
      <HiddenExtensionsProvider value={[hiddenExtensionKey("p", "a")]}>
        <HideableExtension pluginId="p" extensionId="a">
          <i />
        </HideableExtension>
        <HideableExtension pluginId="p" extensionId="b">
          <i />
        </HideableExtension>
      </HiddenExtensionsProvider>
    );
    const [a, b] = Array.from(container.children) as HTMLElement[];
    expect(a.style.display).toBe("none");
    expect(b.style.display).toBe("contents");
  });
});

import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PropertyField from "./PropertyField";

describe("PropertyField latlng", () => {
  it("stores coordinates as an object and shows the saved values", () => {
    const onChange = vi.fn();
    const field = { id: "location", type: "latlng", title: "Location" };
    const show = (value: unknown) => (
      <ThemeProvider theme={darkTheme}>
        <PropertyField field={field} value={value} onChange={onChange} />
      </ThemeProvider>
    );

    const { container, rerender } = render(show({ lat: 10, lng: 20 }));
    const inputs = () => container.querySelectorAll("input");
    fireEvent.change(inputs()[0], { target: { value: "11" } });
    fireEvent.blur(inputs()[0]);

    expect(onChange).toHaveBeenCalledWith({ lat: 11, lng: 20 });
    rerender(show(onChange.mock.lastCall?.[0]));
    expect(inputs()[0]).toHaveValue("11");
    expect(inputs()[1]).toHaveValue("20");
  });
});

import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { render, screen } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { Loading } from "./index";

vi.mock(
  "@reearth/app/lib/reearth-ui/components/Icon/Icons/LogoWithText.svg",
  () => ({
    default: "logo-path.svg"
  })
);

vi.mock("react-spinners", () => ({
  BarLoader: ({ width, color }: { width: number; color: string }) => (
    <div data-testid="mock-bar-loader" data-width={width} data-color={color}>
      Bar Loader
    </div>
  )
}));

describe("Loading Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with default props", () => {
    render(<Loading />);

    const loader = screen.getByTestId("mock-bar-loader");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("data-width", "344");
    expect(loader).toHaveAttribute("data-color", brandRed.dynamicRed);

    expect(document.querySelector("img")).not.toBeInTheDocument();

    const wrapper = loader.parentElement;
    expect(wrapper).toHaveStyle("position: absolute");
  });

  test("includes logo when includeLogo is true", () => {
    render(<Loading includeLogo />);

    const logo = document.querySelector("img");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "logo-path.svg");
    expect(logo).toHaveAttribute("width", "343");
    expect(logo).toHaveAttribute("height", "106");
  });

  test("applies custom color", () => {
    const customColor = "#00FF00";
    render(<Loading color={customColor} />);

    const loader = screen.getByTestId("mock-bar-loader");
    expect(loader).toHaveAttribute("data-color", customColor);
  });

  test("applies custom width", () => {
    const customWidth = 200;
    render(<Loading width={customWidth} />);

    const loader = screen.getByTestId("mock-bar-loader");
    expect(loader).toHaveAttribute("data-width", customWidth.toString());
  });

  test("applies fixed position when fixed prop is true", () => {
    render(<Loading fixed />);

    const wrapper = screen.getByTestId("mock-bar-loader").parentElement;
    expect(wrapper).toHaveStyle("position: fixed");
  });

  test("applies relative position when relative prop is true", () => {
    render(<Loading relative />);

    const wrapper = screen.getByTestId("mock-bar-loader").parentElement;
    expect(wrapper).toHaveStyle("position: relative");
  });

  test("applies background when overlay prop is true", () => {
    render(<Loading overlay />);

    const wrapper = screen.getByTestId("mock-bar-loader").parentElement;
    expect(wrapper).not.toHaveStyle("background: ''");
  });

  test("combines multiple props correctly", () => {
    const customColor = "#0000FF";
    const customWidth = 500;

    render(
      <Loading
        includeLogo
        fixed
        overlay
        color={customColor}
        width={customWidth}
      />
    );

    expect(document.querySelector("img")).toBeInTheDocument();

    const loader = screen.getByTestId("mock-bar-loader");
    expect(loader).toHaveAttribute("data-color", customColor);
    expect(loader).toHaveAttribute("data-width", customWidth.toString());

    const wrapper = loader.parentElement;
    expect(wrapper).toHaveStyle("position: fixed");
    expect(wrapper).not.toHaveStyle("background: ''");
  });
});

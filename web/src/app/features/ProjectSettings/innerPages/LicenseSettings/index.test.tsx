import { licenseContent } from "@reearth/app/lib/license";
import { ProjectMetadata } from "@reearth/services/gql";
import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import LicenseSettings from ".";

const savedLicense = "My existing license";

const projectMetadata = {
  license: savedLicense
} as ProjectMetadata;

const editor = () => screen.getByTestId("license-editor");
const cancelButton = () => screen.getByTestId("license-cancel-changes-btn");
const saveButton = () => screen.getByTestId("license-save-btn");

const chooseTemplate = (label: string) => {
  fireEvent.click(screen.getByTestId("license-template-trigger"));
  fireEvent.click(
    screen
      .getAllByRole("option")
      .find((option) => option.textContent?.startsWith(label)) as HTMLElement
  );
};

describe("LicenseSettings", () => {
  it("keeps both actions disabled until the license is edited", () => {
    render(<LicenseSettings projectMetadata={projectMetadata} />);

    expect(cancelButton()).toBeDisabled();
    expect(saveButton()).toBeDisabled();

    fireEvent.change(editor(), { target: { value: "Something else" } });

    expect(cancelButton()).toBeEnabled();
    expect(saveButton()).toBeEnabled();
  });

  it("lists every license template under its heading, without a No license row", () => {
    render(<LicenseSettings projectMetadata={projectMetadata} />);

    fireEvent.click(screen.getByTestId("license-template-trigger"));

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(11);
    expect(options[0].textContent).toContain(
      "Creative Commons Attribution 4.0 International"
    );
    expect(screen.getByText("Open — Free to use")).toBeInTheDocument();
    expect(
      screen.getByText("Share-alike — Derivatives stay open")
    ).toBeInTheDocument();
    expect(screen.getByText("Limited use")).toBeInTheDocument();
    expect(screen.queryByText("No license")).toBeNull();
  });

  it("replaces the editor with the chosen template", () => {
    render(<LicenseSettings projectMetadata={projectMetadata} />);

    chooseTemplate("MIT License");

    expect(editor()).toHaveValue(licenseContent.mit);
    expect(saveButton()).toBeEnabled();
  });

  it("restores the saved license when changes are cancelled", () => {
    render(<LicenseSettings projectMetadata={projectMetadata} />);

    chooseTemplate("MIT License");
    fireEvent.click(cancelButton());

    expect(editor()).toHaveValue(savedLicense);
    expect(cancelButton()).toBeDisabled();
    expect(saveButton()).toBeDisabled();
  });

  it("saves the edited license", () => {
    const onUpdateProjectMetadata = vi.fn();
    render(
      <LicenseSettings
        projectMetadata={projectMetadata}
        onUpdateProjectMetadata={onUpdateProjectMetadata}
      />
    );

    fireEvent.change(editor(), { target: { value: "A rewritten license" } });
    fireEvent.click(saveButton());

    expect(onUpdateProjectMetadata).toHaveBeenCalledWith({
      license: "A rewritten license"
    });
  });
});

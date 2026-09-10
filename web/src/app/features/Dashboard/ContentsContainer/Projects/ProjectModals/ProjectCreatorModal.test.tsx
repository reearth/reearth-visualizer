import { act, fireEvent, render, screen } from "@reearth/test/utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProjectCreatorModal from "./ProjectCreatorModal";

const VALIDATION_DEBOUNCE_MS = 600;

const mockValidateProjectAlias = vi.fn();
const mockAppFeature = vi.fn(() => ({ projectVisibility: true }));
const mockWorkspacePolicyCheck = vi.fn(
  (_workspaceId: string): {
    workspacePolicyCheck: { enableToCreatePrivateProject: boolean };
  } => ({
    workspacePolicyCheck: { enableToCreatePrivateProject: true }
  })
);

vi.mock("@reearth/services/api/project", () => ({
  useValidateProjectAlias: () => ({
    validateProjectAlias: mockValidateProjectAlias
  })
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspacePolicyCheck: (workspaceId: string) =>
    mockWorkspacePolicyCheck(workspaceId)
}));

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: () => mockAppFeature()
}));

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const fillRequiredFields = (alias = "my-project") => {
  fireEvent.change(screen.getByTestId("project-name-input"), {
    target: { value: "My Project" }
  });
  fireEvent.change(screen.getByTestId("project-alias-input"), {
    target: { value: alias }
  });
};

const settleAliasValidation = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(VALIDATION_DEBOUNCE_MS);
  });
};

describe("ProjectCreatorModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockValidateProjectAlias.mockReset();
    mockAppFeature.mockReturnValue({ projectVisibility: true });
    mockWorkspacePolicyCheck.mockReturnValue({
      workspacePolicyCheck: { enableToCreatePrivateProject: true }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies its test id to the modal root", () => {
    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    // Modal exposes `dataTestid`, not `data-testid` — passing the latter compiles
    // (TypeScript special-cases data-* attributes) but is dropped at runtime.
    expect(screen.getByTestId("project-creator-modal")).toHaveAttribute(
      "role",
      "dialog"
    );
  });

  it("keeps Apply disabled until the name is set and the alias has been validated", async () => {
    mockValidateProjectAlias.mockResolvedValue({ available: true });

    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    const applyButton = screen.getByTestId("project-creator-apply-btn");
    expect(applyButton).toBeDisabled();

    fireEvent.change(screen.getByTestId("project-name-input"), {
      target: { value: "My Project" }
    });
    expect(applyButton).toBeDisabled();

    fireEvent.change(screen.getByTestId("project-alias-input"), {
      target: { value: "my-project" }
    });
    // Still debouncing/validating the alias, so Apply must stay disabled.
    expect(applyButton).toBeDisabled();

    await settleAliasValidation();

    expect(mockValidateProjectAlias).toHaveBeenCalledWith(
      "my-project",
      "workspace-id",
      undefined
    );
    expect(applyButton).not.toBeDisabled();
  });

  it("treats an unavailable alias as an error even when the server sends no message", async () => {
    mockValidateProjectAlias.mockResolvedValue({
      available: false,
      errors: undefined
    });

    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    fillRequiredFields("taken-alias");
    await settleAliasValidation();

    expect(screen.getByTestId("project-creator-apply-btn")).toBeDisabled();
    // ModalPanel itself also renders a "close" icon (its dismiss button), so
    // assert the alias field's own error icon shows up alongside it.
    expect(screen.getAllByTestId("icon-close").length).toBeGreaterThan(1);
  });

  it("ignores a stale alias validation response that resolves after a newer one", async () => {
    const firstRequest = deferred<{
      available: boolean;
      errors?: { extensions?: { description?: string } }[];
    }>();
    const secondRequest = deferred<{ available: boolean }>();

    // Keyed by alias rather than call order: the component may re-run the
    // validation effect more than once for the same debounced value (e.g. on
    // unrelated re-renders), so order-based mocks would be brittle here.
    mockValidateProjectAlias.mockImplementation((alias: string) => {
      if (alias === "ab") return firstRequest.promise;
      if (alias === "abc") return secondRequest.promise;
      return Promise.resolve({ available: false });
    });

    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    fireEvent.change(screen.getByTestId("project-name-input"), {
      target: { value: "My Project" }
    });

    fireEvent.change(screen.getByTestId("project-alias-input"), {
      target: { value: "ab" }
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VALIDATION_DEBOUNCE_MS);
    });

    fireEvent.change(screen.getByTestId("project-alias-input"), {
      target: { value: "abc" }
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VALIDATION_DEBOUNCE_MS);
    });

    expect(mockValidateProjectAlias).toHaveBeenCalledWith(
      "abc",
      "workspace-id",
      undefined
    );

    // The newer ("abc") request resolves first with a real success...
    await act(async () => {
      secondRequest.resolve({ available: true });
      await Promise.resolve();
    });

    // ...then the older ("ab") request resolves late with a failure. It must
    // not clobber the success state produced by the newer request.
    await act(async () => {
      firstRequest.resolve({
        available: false,
        errors: [{ extensions: { description: "ab is not available" } }]
      });
      await Promise.resolve();
    });

    expect(screen.getByTestId("project-creator-apply-btn")).not.toBeDisabled();
    expect(screen.queryByText("ab is not available")).not.toBeInTheDocument();
  });

  it("calls onClose without creating a project when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const onProjectCreate = vi.fn();

    render(
      <ProjectCreatorModal onClose={onClose} onProjectCreate={onProjectCreate} />
    );

    fireEvent.click(screen.getByTestId("project-creator-cancel-btn"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onProjectCreate).not.toHaveBeenCalled();
  });

  it("submits the trimmed alias and closes only after project creation succeeds", async () => {
    mockValidateProjectAlias.mockResolvedValue({ available: true });
    const onClose = vi.fn();
    const onProjectCreate = vi.fn().mockResolvedValue(true);

    render(
      <ProjectCreatorModal onClose={onClose} onProjectCreate={onProjectCreate} />
    );

    fireEvent.change(screen.getByTestId("project-name-input"), {
      target: { value: "My Project" }
    });
    fireEvent.change(screen.getByTestId("project-alias-input"), {
      target: { value: "  my-project  " }
    });
    await settleAliasValidation();

    await act(async () => {
      fireEvent.click(screen.getByTestId("project-creator-apply-btn"));
      await Promise.resolve();
    });

    expect(onProjectCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "My Project",
        projectAlias: "my-project",
        visibility: "public",
        license: undefined
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the modal open and preserves entered data when project creation fails", async () => {
    mockValidateProjectAlias.mockResolvedValue({ available: true });
    const onClose = vi.fn();
    const onProjectCreate = vi.fn().mockResolvedValue(false);

    render(
      <ProjectCreatorModal onClose={onClose} onProjectCreate={onProjectCreate} />
    );

    fillRequiredFields();
    await settleAliasValidation();

    await act(async () => {
      fireEvent.click(screen.getByTestId("project-creator-apply-btn"));
      await Promise.resolve();
    });

    expect(onProjectCreate).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("project-name-input")).toHaveValue("My Project");
  });

  it("hides the visibility section when the projectVisibility feature is disabled", () => {
    mockAppFeature.mockReturnValue({ projectVisibility: false });

    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    expect(
      screen.queryByTestId("project-creator-project-visibility-wrapper")
    ).not.toBeInTheDocument();
  });

  it("disables the private option when the workspace policy forbids private projects", () => {
    mockWorkspacePolicyCheck.mockReturnValue({
      workspacePolicyCheck: { enableToCreatePrivateProject: false }
    });

    render(<ProjectCreatorModal onProjectCreate={vi.fn()} />);

    const privateRadio = screen
      .getAllByRole("radio")
      .find((radio) => (radio as HTMLInputElement).value === "private");
    expect(privateRadio).toBeDisabled();
  });
});

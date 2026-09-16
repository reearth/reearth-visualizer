import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Project } from "../../../type";

import useHooks from "./hooks";

const mockPublishProject = vi.fn();
const mockPublishStory = vi.fn();
const mockExportProject = vi.fn();

let mockStories: { id: string; publishmentStatus: string }[] = [];

vi.mock("@reearth/services/api/project", () => ({
  useProjectMutations: () => ({ publishProject: mockPublishProject }),
  useProjectImportExportMutations: () => ({
    exportProject: mockExportProject
  })
}));

vi.mock("@reearth/services/api/storytelling", () => ({
  useStoryMutations: () => ({ publishStory: mockPublishStory }),
  useStories: () => ({ stories: mockStories })
}));

const baseProject: Project = {
  id: "project-1",
  name: "My Project",
  workspaceId: "workspace-1",
  starred: false,
  status: "published",
  sceneId: "scene-1",
  isPublished: true
};

describe("Project hooks - handleProjectRemove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStories = [];
    mockPublishProject.mockResolvedValue({ status: "success" });
    mockPublishStory.mockResolvedValue({ status: "success" });
  });

  it("finishes unpublishing the project before archiving it", async () => {
    const callOrder: string[] = [];
    // The push happens after a microtask hop, so it only lands ahead of
    // "archive" if the caller actually awaits this call instead of firing
    // it and moving on immediately.
    mockPublishProject.mockImplementation(async () => {
      await Promise.resolve();
      callOrder.push("unpublish-project");
      return { status: "success" };
    });
    // A plain (non-async) function so its body — and thus the push — runs
    // synchronously the instant it's invoked, regardless of awaiting.
    const onProjectRemove = vi.fn(() => {
      callOrder.push("archive");
      return Promise.resolve(true);
    });

    const { result } = renderHook(() =>
      useHooks({ project: baseProject, onProjectRemove })
    );

    await act(async () => {
      await result.current.handleProjectRemove(baseProject.id);
    });

    // Archiving must not start until the unpublish call has actually
    // resolved, otherwise a published project could be moved to the
    // Recycle Bin while still publicly accessible.
    expect(callOrder).toEqual(["unpublish-project", "archive"]);
  });

  it("waits for every published story to be unpublished before archiving", async () => {
    mockStories = [
      { id: "story-1", publishmentStatus: "PUBLIC" },
      { id: "story-2", publishmentStatus: "LIMITED" }
    ];
    const callOrder: string[] = [];
    mockPublishStory.mockImplementation(async (_status, storyId) => {
      await Promise.resolve();
      callOrder.push(`unpublish-story-${storyId}`);
      return { status: "success" };
    });
    const onProjectRemove = vi.fn(() => {
      callOrder.push("archive");
      return Promise.resolve(true);
    });

    const { result } = renderHook(() =>
      useHooks({
        project: { ...baseProject, status: "unpublished", isPublished: false },
        onProjectRemove
      })
    );

    await act(async () => {
      await result.current.handleProjectRemove(baseProject.id);
    });

    expect(callOrder).toEqual([
      "unpublish-story-story-1",
      "unpublish-story-story-2",
      "archive"
    ]);
  });

  it("skips unpublish calls entirely when nothing is published", async () => {
    const onProjectRemove = vi.fn();

    const { result } = renderHook(() =>
      useHooks({
        project: {
          ...baseProject,
          status: "unpublished",
          isPublished: false
        },
        onProjectRemove
      })
    );

    await act(async () => {
      await result.current.handleProjectRemove(baseProject.id);
    });

    expect(mockPublishProject).not.toHaveBeenCalled();
    expect(mockPublishStory).not.toHaveBeenCalled();
    expect(onProjectRemove).toHaveBeenCalledWith(baseProject.id);
  });

  it("closes the remove modal only after archiving completes", async () => {
    const { result } = renderHook(() =>
      useHooks({
        project: { ...baseProject, status: "unpublished", isPublished: false },
        onProjectRemove: vi.fn().mockResolvedValue(true)
      })
    );

    act(() => {
      result.current.handleProjectRemoveModal(true);
    });
    expect(result.current.projectRemoveModalVisible).toBe(true);

    await act(async () => {
      await result.current.handleProjectRemove(baseProject.id);
    });

    expect(result.current.projectRemoveModalVisible).toBe(false);
  });

  it("keeps the remove modal open when archiving fails", async () => {
    const { result } = renderHook(() =>
      useHooks({
        project: { ...baseProject, status: "unpublished", isPublished: false },
        onProjectRemove: vi.fn().mockResolvedValue(false)
      })
    );

    act(() => {
      result.current.handleProjectRemoveModal(true);
    });

    await act(async () => {
      await result.current.handleProjectRemove(baseProject.id);
    });

    // A failed removal must not look like a success — the user should still
    // see the modal and be able to retry or cancel.
    expect(result.current.projectRemoveModalVisible).toBe(true);
  });

  it("does nothing when called with an empty projectId", async () => {
    const onProjectRemove = vi.fn();
    const { result } = renderHook(() =>
      useHooks({ project: baseProject, onProjectRemove })
    );

    await act(async () => {
      await result.current.handleProjectRemove("");
    });

    expect(onProjectRemove).not.toHaveBeenCalled();
    expect(mockPublishProject).not.toHaveBeenCalled();
  });
});

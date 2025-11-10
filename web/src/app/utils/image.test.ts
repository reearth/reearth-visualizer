import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { getImageDimensions } from "./image";

type MockImage = {
  onload: () => void;
  onerror: () => void;
  src: string;
  width: number;
  height: number;
};
describe("getImageDimensions", () => {
  const originalImage = global.Image;
  let mockImage: MockImage;

  beforeEach(() => {
    mockImage = {
      onload: () => {},
      onerror: () => {},
      src: "",
      width: 0,
      height: 0
    };

    global.Image = vi.fn(function () {
      return mockImage as unknown as HTMLImageElement;
    }) as unknown as typeof Image;
  });

  afterEach(() => {
    global.Image = originalImage;
    vi.restoreAllMocks();
  });

  it("should resolve with correct dimensions when image loads successfully", async () => {
    const imageUrl = "https://example.com/image.jpg";
    const abortController = new AbortController();
    const expectedDimensions = { width: 800, height: 600 };

    const dimensionsPromise = getImageDimensions(imageUrl, abortController);

    mockImage.width = expectedDimensions.width;
    mockImage.height = expectedDimensions.height;
    mockImage.onload();

    const dimensions = await dimensionsPromise;
    expect(dimensions).toEqual(expectedDimensions);
    expect(mockImage.src).toBe(imageUrl);
  });

  it("should reject with error when image fails to load", async () => {
    const imageUrl = "https://example.com/invalid-image.jpg";
    const abortController = new AbortController();

    const dimensionsPromise = getImageDimensions(imageUrl, abortController);

    mockImage.onerror();

    await expect(dimensionsPromise).rejects.toThrowError(
      "Failed to load image"
    );
    expect(mockImage.src).toBe(imageUrl);
  });

  it("should abort image loading when abort signal is triggered", async () => {
    const imageUrl = "https://example.com/image.jpg";
    const abortController = new AbortController();

    const dimensionsPromise = getImageDimensions(imageUrl, abortController);

    abortController.abort();

    expect(mockImage.src).toBe("");

    mockImage.width = 800;
    mockImage.height = 600;
    mockImage.onload();

    let promiseState = "pending";

    dimensionsPromise
      .then(() => {
        promiseState = "resolved";
      })
      .catch(() => {
        promiseState = "rejected";
      });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(promiseState).toBe("pending");
  });
});

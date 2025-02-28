export function getImageDimensions(
  imageUrl: string,
  abortController: AbortController
): Promise<{ width: number; height: number }> {
  const signal = abortController.signal;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      if (!signal.aborted) {
        resolve({ width: img.width, height: img.height });
      }
    };

    img.onerror = () => {
      if (!signal.aborted) {
        reject(new Error("Failed to load image"));
      }
    };

    signal.addEventListener("abort", () => {
      img.src = ""; // Stops the image loading if cancelled
    });

    img.src = imageUrl;
  });
}

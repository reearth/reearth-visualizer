import { Page, expect } from "@playwright/test";

export type CameraPosition = {
  lat: number;
  lng: number;
  height: number;
  heading?: number;
  pitch?: number;
  roll?: number;
};

// Mirrors the real return type: { center?: LatLngHeight; viewSize?: number } | undefined
type GlobeIntersectionResult =
  | {
      center?: { lat: number; lng: number; height: number };
      viewSize?: number;
    }
  | undefined;

/**
 * Camera-state assertions backed by window.reearth camera API.
 *
 * getPosition() is diagnostic only — it does not prove rendering correctness.
 * The primary pass condition is expectViewCenterNear(), which calls
 * getGlobeIntersection() to confirm the camera view frustum actually
 * intersects the target area on the rendered globe.
 *
 * resetToBaseline() must be called in beforeEach to prevent state bleed.
 */
export class CameraAssertions {
  constructor(private page: Page) {}

  async getPosition(): Promise<CameraPosition | null> {
    return this.page.evaluate(() => {
      const pos = (
        window as { reearth?: { camera?: { position?: unknown } } }
      ).reearth?.camera?.position;
      return pos as CameraPosition | null;
    });
  }

  /**
   * Primary semantic visual assertion.
   *
   * Calls getGlobeIntersection({ calcViewSize: false }) and asserts its
   * `center` is within precisionDeg degrees of the target lat/lng.
   * This proves the camera is actually looking at the target on the 3D globe,
   * not just that the position state variable was updated.
   *
   * Requires pitch: -Math.PI/2 (camera pointing straight down). If pitch is
   * oblique, getGlobeIntersection may return undefined (frustum misses globe).
   * resetToBaseline() and setView both set this correctly.
   */
  async expectViewCenterNear(
    lat: number,
    lng: number,
    precisionDeg = 2
  ): Promise<void> {
    const result = await this.page.evaluate(() => {
      type IntersectionReturn =
        | { center?: { lat: number; lng: number; height: number }; viewSize?: number }
        | undefined;
      const cam = (
        window as {
          reearth?: {
            camera?: {
              getGlobeIntersection?: (opts: {
                withTerrain?: boolean;
                calcViewSize?: boolean;
              }) => IntersectionReturn;
            };
          };
        }
      ).reearth?.camera;
      return cam?.getGlobeIntersection?.({ calcViewSize: false });
    }) as GlobeIntersectionResult;

    expect(
      result,
      `getGlobeIntersection returned undefined — camera may not be looking at the globe. ` +
        `Check that pitch is set to -Math.PI/2.`
    ).toBeDefined();

    const center = result?.center;
    expect(
      center,
      `getGlobeIntersection returned no center position`
    ).toBeDefined();

    if (!center) return;

    expect(
      Math.abs(center.lat - lat),
      `Camera lat ${center.lat.toFixed(2)} is not within ${precisionDeg}° of target ${lat}`
    ).toBeLessThan(precisionDeg);

    expect(
      Math.abs(center.lng - lng),
      `Camera lng ${center.lng.toFixed(2)} is not within ${precisionDeg}° of target ${lng}`
    ).toBeLessThan(precisionDeg);
  }

  /**
   * Polls camera position until within toleranceDeg degrees of target.
   * Used to detect when flyTo animation has reached its destination —
   * the first `move` event only means animation started, not arrived.
   */
  async waitUntilNear(
    lat: number,
    lng: number,
    toleranceDeg = 2,
    totalTimeoutMs = 15_000
  ): Promise<void> {
    const deadline = Date.now() + totalTimeoutMs;
    let lastPos: CameraPosition | null = null;

    while (Date.now() < deadline) {
      const pos = await this.getPosition();
      if (pos) {
        lastPos = pos;
        if (
          Math.abs(pos.lat - lat) < toleranceDeg &&
          Math.abs(pos.lng - lng) < toleranceDeg
        ) {
          return;
        }
      }
      await this.page.waitForTimeout(300);
    }

    const posDesc = lastPos
      ? `last position: lat=${lastPos.lat.toFixed(2)}, lng=${lastPos.lng.toFixed(2)}`
      : "no position available";
    throw new Error(
      `waitUntilNear: camera did not reach (${lat}, ${lng}) within ${totalTimeoutMs}ms — ${posDesc}`
    );
  }

  /**
   * Resets camera to a known baseline via window.reearth.camera.setView.
   * Always sets pitch: -Math.PI/2 (straight down) so getGlobeIntersection
   * reliably returns a center position.
   *
   * Must be called in beforeEach to prevent state pollution between tests.
   */
  async resetToBaseline(): Promise<void> {
    await this.page.evaluate(() => {
      const cam = (
        window as {
          reearth?: { camera?: { setView?: (v: unknown) => void } };
        }
      ).reearth?.camera;
      cam?.setView?.({
        lat: 0,
        lng: 0,
        height: 10_000_000,
        heading: 0,
        pitch: -Math.PI / 2,
        roll: 0
      });
    });

    // Give Cesium one frame to apply the camera change
    await this.page.waitForTimeout(500);
  }
}

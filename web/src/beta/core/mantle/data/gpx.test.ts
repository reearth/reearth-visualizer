import { expect, test, vi } from "vitest";

import { Data } from "../types";

import { fetchGPXfile } from "./gpx";
import * as Utils from "./utils";

test("with header", async () => {
  const mockGPXData = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPS Visualizer https://www.gpsvisualizer.com/">
  <trk>
    <name>Example GPX Data</name>
    <trkseg>
      <trkpt lat="37.844799" lon="-122.257127">
        <ele>2.2</ele>
        <time>2023-02-19T23:04:00.000Z</time>
      </trkpt>
      <trkpt lat="37.844812" lon="-122.257126">
        <ele>2.1</ele>
        <time>2023-02-19T23:04:10.000Z</time>
      </trkpt>
      <trkpt lat="37.844797" lon="-122.257131">
        <ele>2.3</ele>
        <time>2023-02-19T23:04:20.000Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
`;

  test("returns a list of GeoJSON LineString features", async () => {
    const fetchDataMock = vi.spyOn(Utils, "f");
    fetchDataMock.mockImplementation(async () => {
      return {
        text: async () => mockGPXData,
      } as Response;
    });
    const data: Data = {
      type: "gpx",
      url: "https://example.com/tracks.gpx",
    };
    const features = await fetchGPXfile(data);
    expect(Array.isArray(features)).toBe(true);
    features?.forEach(f => {
      expect(f.type).toBe("feature");
      expect(f?.geometry?.type).toBe("LineString");
      expect(Array.isArray(f?.geometry?.coordinates)).toBe(true);
      expect(f?.geometry?.coordinates.length).toBeGreaterThanOrEqual(2);
    });
  });

  test("parses GPX files with one or multiple tracks", async () => {
    const fetchDataMock = vi.spyOn(Utils, "f");
    fetchDataMock.mockImplementation(async () => {
      return {
        text: async () => mockGPXData,
      } as Response;
    });
    const data: Data = {
      type: "gpx",
      url: "https://example.com/tracks.gpx",
    };
    const features = await fetchGPXfile(data);
    expect(Array.isArray(features)).toBe(true);
    expect(features?.length).toBeGreaterThan(0);
  });
});

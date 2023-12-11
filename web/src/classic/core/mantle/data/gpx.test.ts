import { describe, expect, test, vi } from "vitest";

import { Data } from "../types";

import { fetchGPXfile } from "./gpx";
import * as Utils from "./utils";

describe("with header", async () => {
  const mockGPXData = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" creator="Yamareco Android 6.1.3 - www.yamareco.com">
  <trk><name>track</name><number>1</number><trkseg>
  <trkpt lat="37.7237236" lon="140.2551358"><ele>1578</ele><time>2022-09-24T23:05:14Z</time></trkpt>
  <trkpt lat="37.7237021" lon="140.255021"><ele>1578</ele><time>2022-09-24T23:06:23Z</time></trkpt>
  <trkpt lat="37.7234781" lon="140.254876"><ele>1578</ele><time>2022-09-24T23:06:37Z</time></trkpt>
  <trkpt lat="37.7233925" lon="140.2548113"><ele>1578</ele><time>2022-09-24T23:07:22Z</time></trkpt>
  <trkpt lat="37.7231886" lon="140.2548331"><ele>1577</ele><time>2022-09-24T23:07:42Z</time></trkpt>
  </trkseg>
  </trk>
  <trk><name>track</name><number>2</number><trkseg>
  <trkpt lat="37.7237236" lon="140.2551358"><ele>1578</ele><time>2022-09-24T23:05:14Z</time></trkpt>
  <trkpt lat="37.7237021" lon="140.255021"><ele>1578</ele><time>2022-09-24T23:06:23Z</time></trkpt>
  <trkpt lat="37.7234781" lon="140.254876"><ele>1578</ele><time>2022-09-24T23:06:37Z</time></trkpt>
  <trkpt lat="37.7233925" lon="140.2548113"><ele>1578</ele><time>2022-09-24T23:07:22Z</time></trkpt>
  <trkpt lat="37.7231886" lon="140.2548331"><ele>1577</ele><time>2022-09-24T23:07:42Z</time></trkpt>
  </trkseg>
  </trk>
  </gpx>`;

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

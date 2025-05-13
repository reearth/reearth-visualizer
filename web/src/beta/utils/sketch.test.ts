import { describe, it, expect } from "vitest";

import {
  BUILT_IN_REEARTH_PROPERTIES_NAME,
  BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME,
  getPhotoOverlayValue,
  generateNewPropertiesWithPhotoOverlay,
  SketchFeatureProperties,
  PhotoOverlayValue
} from "./sketch";

describe("PhotoOverlay Utility Functions", () => {
  const mockCamera = {
    lat: 35.681236,
    lng: 139.767125,
    height: 100,
    heading: 30,
    pitch: -20,
    roll: 0,
    fov: 60
  };

  const mockPhotoOverlayValue: PhotoOverlayValue = {
    camera: mockCamera,
    url: "https://example.com/photo.jpg",
    fill: "contain",
    widthPct: 80,
    description: "Example photo overlay"
  };

  const mockProperties: SketchFeatureProperties = {
    name: "Test Feature",
    [BUILT_IN_REEARTH_PROPERTIES_NAME]: {
      [BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME]: mockPhotoOverlayValue
    }
  };

  describe("getPhotoOverlayValue", () => {
    it("should return undefined for undefined properties", () => {
      const result = getPhotoOverlayValue(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined if no photo overlay exists", () => {
      const propertiesWithoutPhotoOverlay: SketchFeatureProperties = {
        name: "Test Feature",
        [BUILT_IN_REEARTH_PROPERTIES_NAME]: {}
      };
      const result = getPhotoOverlayValue(propertiesWithoutPhotoOverlay);
      expect(result).toBeUndefined();
    });

    it("should correctly extract photo overlay value", () => {
      const result = getPhotoOverlayValue(mockProperties);
      expect(result).toEqual(mockPhotoOverlayValue);
    });
  });

  describe("generateNewPropertiesWithPhotoOverlay", () => {
    it("should add photo overlay to properties without existing one", () => {
      const propertiesWithoutPhotoOverlay: SketchFeatureProperties = {
        name: "Test Feature",
        [BUILT_IN_REEARTH_PROPERTIES_NAME]: {}
      };

      const newValue: PhotoOverlayValue = {
        url: "https://example.com/new-photo.jpg",
        fill: "fixed",
        widthPct: 50
      };

      const result = generateNewPropertiesWithPhotoOverlay(
        propertiesWithoutPhotoOverlay,
        newValue
      );

      expect(
        result[BUILT_IN_REEARTH_PROPERTIES_NAME][
          BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME
        ]
      ).toEqual(newValue);
      expect(result.name).toBe("Test Feature");
    });

    it("should update existing photo overlay in properties", () => {
      const updatedValue: PhotoOverlayValue = {
        url: "https://example.com/updated-photo.jpg",
        fill: "fixed",
        widthPct: 60,
        description: "Updated description"
      };

      const result = generateNewPropertiesWithPhotoOverlay(
        mockProperties,
        updatedValue
      );

      expect(
        result[BUILT_IN_REEARTH_PROPERTIES_NAME][
          BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME
        ]
      ).toEqual(updatedValue);
    });

    it("should remove photo overlay when value is undefined", () => {
      const result = generateNewPropertiesWithPhotoOverlay(
        mockProperties,
        undefined
      );

      expect(
        result[BUILT_IN_REEARTH_PROPERTIES_NAME][
          BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME
        ]
      ).toBeUndefined();
    });

    it("should preserve other properties in _reearth", () => {
      const propertiesWithExtraReearthProps = {
        name: "Test Feature",
        [BUILT_IN_REEARTH_PROPERTIES_NAME]: {
          [BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME]: mockPhotoOverlayValue,
          someOtherProperty: "value"
        }
      };

      const updatedValue: PhotoOverlayValue = {
        url: "https://example.com/new.jpg"
      };

      const result = generateNewPropertiesWithPhotoOverlay(
        propertiesWithExtraReearthProps,
        updatedValue
      );

      expect(
        (
          result[
            BUILT_IN_REEARTH_PROPERTIES_NAME
          ] as SketchFeatureProperties & {
            someOtherProperty?: string;
          }
        ).someOtherProperty
      ).toBe("value");
      expect(
        result[BUILT_IN_REEARTH_PROPERTIES_NAME][
          BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME
        ]
      ).toEqual(updatedValue);
    });
  });
});

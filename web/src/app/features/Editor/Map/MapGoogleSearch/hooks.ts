import { Loader } from "@googlemaps/js-api-loader";
import { useT } from "@reearth/services/i18n/hooks";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect
} from "react";

import { useMapPage } from "../context";

// ==================== Constants ====================

// Debounce timing
const SEARCH_DEBOUNCE_MS = 500;

// Google Maps configuration
//TODO: Delete this and use BE API management system when available
const GOOGLE_MAPS_LIBRARIES = ["places"];
const GOOGLE_PLACES_SEARCH_FIELDS = [
  "displayName",
  "location",
  "formattedAddress"
];
const MAX_SEARCH_RESULTS = 20;

// UI positioning
const DROPDOWN_OFFSET_PX = 4;

// Layer configuration
const LAYER_TYPE_SIMPLE = "simple";
const DATA_TYPE_GEOJSON = "geojson";
const GEOJSON_FEATURE_TYPE = "Feature";
const GEOMETRY_TYPE_POINT = "Point";
const MARKER_ALTITUDE = 0;

// Camera fly-to configuration
const CAMERA_HEIGHT = 3000;
const CAMERA_HEADING = 0;
const CAMERA_PITCH = -1.5;
const CAMERA_ROLL = 0;
const CAMERA_FOV = 1.0471975511965976; // 60 degrees in radians
const CAMERA_ANIMATION_DURATION = 2;

// Keyboard keys
const KEY_ENTER = "Enter";

// ==================== Type Definitions ====================
//TODO: Refactor this and use BE API management system when available

type MapSearchPlace = {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  layerId?: string; // Marker ID on the map
};

type GooglePlacesResult = {
  id: string;
  formattedAddress: string;
  displayName: string;
  location: {
    lat: () => number;
    lng: () => number;
  };
};

// ==================== Google Maps Service ====================
//TODO: Delete this and use BE API management system when available
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Place: {
            searchByText: (request: {
              textQuery: string;
              fields: string[];
              maxResultCount: number;
            }) => Promise<{
              places: GooglePlacesResult[];
            }>;
          };
        };
      };
    };
  }
}

let loaderInstance: Loader | null = null;

/**
 * Load Google Maps API
 * Note: This is a module-level function. If you want to replace it with another service in the future,
 * you can extract this part into a separate service module.
 */
const loadGoogleMaps = async (
  apiKey: string,
  language: string
): Promise<void> => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      libraries: GOOGLE_MAPS_LIBRARIES as "places"[],
      language
    });
  }
  await loaderInstance.load();
};

/**
 * Search places using Google Places API
 * Future replacement point: This function can be replaced with a backend API call
 */
const searchPlaces = async (query: string): Promise<MapSearchPlace[]> => {
  if (!window.google?.maps?.places) {
    return [];
  }

  try {
    const { places } = await window.google.maps.places.Place.searchByText({
      textQuery: query,
      fields: GOOGLE_PLACES_SEARCH_FIELDS,
      maxResultCount: MAX_SEARCH_RESULTS
    });

    if (!places || places.length === 0) {
      return [];
    }

    return places.map((p: GooglePlacesResult) => ({
      place_id: p.id,
      formatted_address: p.formattedAddress || "",
      name: p.displayName || "",
      geometry: {
        location: {
          lat: p.location?.lat(),
          lng: p.location?.lng()
        }
      }
    }));
  } catch (error) {
    console.error("Search places error:", error);
    return [];
  }
};

// ==================== Main Hook ====================

type UseMapSearchParams = {
  apiKey: string;
};

export const useMapSearch = ({ apiKey }: UseMapSearchParams) => {
  const { visualizerRef, handleFlyTo } = useMapPage();
  const t = useT();

  const language = navigator.language;

  // State management
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapSearchPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapSearchPlace | null>(
    null
  );
  const [isServiceReady, setIsServiceReady] = useState(false);

  // Dropdown position tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Initialize Google Maps
  //TODO: Delete this and use BE API management system when available
  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current || !apiKey || !language) {
      return;
    }

    didLoadRef.current = true;

    loadGoogleMaps(apiKey, language)
      .then(() => {
        setIsServiceReady(true);
      })
      .catch((error) => {
        console.error("Failed to load Google Maps:", error);
      });
  }, [apiKey, language]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search
  useEffect(() => {
    // Don't search if:
    // 1. Service is not ready
    // 2. Query is empty
    // 3. A place is already selected (avoid triggering search after selection)
    if (!isServiceReady || !debouncedQuery.trim() || selectedPlace) {
      return;
    }

    searchPlaces(debouncedQuery).then((results) => {
      setSuggestions(results);
    });
  }, [debouncedQuery, isServiceReady, selectedPlace]);

  // Update dropdown position based on SearchBox position (not Container, to account for padding)
  const updateDropdownPosition = useCallback(() => {
    if (!searchBoxRef.current || suggestions.length === 0) {
      setDropdownPosition(null);
      return;
    }

    const rect = searchBoxRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + DROPDOWN_OFFSET_PX,
      left: rect.left,
      width: rect.width
    });
  }, [suggestions.length]);

  // Track dropdown position - initial positioning and window events
  useLayoutEffect(() => {
    if (suggestions.length === 0) return;

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [suggestions.length, updateDropdownPosition]);

  // Track SearchBox resize changes (e.g., when Inspector panel is resized)
  useEffect(() => {
    if (suggestions.length === 0) return;

    const searchBox = searchBoxRef.current;
    if (!searchBox) return;

    const resizeObserver = new ResizeObserver(() => {
      updateDropdownPosition();
    });

    // Observe the SearchBox element directly since we calculate position from it
    resizeObserver.observe(searchBox);

    return () => {
      resizeObserver.disconnect();
    };
  }, [suggestions.length, updateDropdownPosition]);

  // Track SearchBox position changes using requestAnimationFrame
  // This is necessary because ResizeObserver only detects size changes, not position changes
  // When Inspector panel is collapsed/expanded, SearchBox position (left) changes but size may not
  useEffect(() => {
    if (suggestions.length === 0) return;

    let animationFrameId: number;
    let lastLeft = 0;
    let lastTop = 0;

    const checkPosition = () => {
      const searchBox = searchBoxRef.current;
      if (!searchBox) {
        animationFrameId = requestAnimationFrame(checkPosition);
        return;
      }

      const rect = searchBox.getBoundingClientRect();

      // Only update if position actually changed (avoid unnecessary re-renders)
      if (rect.left !== lastLeft || rect.top !== lastTop) {
        lastLeft = rect.left;
        lastTop = rect.top;
        updateDropdownPosition();
      }

      animationFrameId = requestAnimationFrame(checkPosition);
    };

    animationFrameId = requestAnimationFrame(checkPosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [suggestions.length, updateDropdownPosition]);

  // Event handlers

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      // Clear selected state when user starts typing again
      if (selectedPlace) {
        setSelectedPlace(null);
      }
    },
    [selectedPlace]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEY_ENTER) {
        setDebouncedQuery(query);
      }
    },
    [query]
  );

  const handleSelectPlace = useCallback(
    (place: MapSearchPlace) => {
      const lat = place.geometry?.location?.lat;
      const lng = place.geometry?.location?.lng;

      // Remove previous marker if exists
      if (selectedPlace?.layerId) {
        visualizerRef?.current?.layers?.deleteLayer(selectedPlace.layerId);
      }

      // Add new marker
      const layer = visualizerRef?.current?.layers?.add({
        type: LAYER_TYPE_SIMPLE,
        data: {
          type: DATA_TYPE_GEOJSON,
          value: {
            type: GEOJSON_FEATURE_TYPE,
            geometry: {
              coordinates: [lng, lat, MARKER_ALTITUDE],
              type: GEOMETRY_TYPE_POINT
            }
          }
        }
      });

      // Update state
      const placeWithLayer = { ...place, layerId: layer?.id };
      setSelectedPlace(placeWithLayer);
      setQuery(`${place.formatted_address}, ${place.name}`);
      setSuggestions([]);

      // Fly to the location
      handleFlyTo?.(
        {
          lat,
          lng,
          height: CAMERA_HEIGHT,
          heading: CAMERA_HEADING,
          pitch: CAMERA_PITCH,
          roll: CAMERA_ROLL,
          fov: CAMERA_FOV
        },
        { duration: CAMERA_ANIMATION_DURATION }
      );
    },
    [visualizerRef, handleFlyTo, selectedPlace]
  );

  const handleClear = useCallback(() => {
    // Remove marker
    if (selectedPlace?.layerId) {
      visualizerRef?.current?.layers?.deleteLayer(selectedPlace.layerId);
    }
    // Clear all state
    setQuery("");
    setDebouncedQuery("");
    setSelectedPlace(null);
    setSuggestions([]);
  }, [visualizerRef, selectedPlace]);

  // Return interface for the component
  return {
    // State
    query,
    suggestions,
    selectedPlace,
    containerRef,
    searchBoxRef,
    dropdownPosition,

    // Event handlers
    handleInputChange,
    handleKeyDown,
    handleSelectPlace,
    handleClear,

    // Computed properties
    inputPlaceholder: t("Search Map")
  };
};

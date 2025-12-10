import { Loader } from "@googlemaps/js-api-loader";
import { useT } from "@reearth/services/i18n";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect
} from "react";

import { useMapPage } from "../context";

// ==================== Type Definitions ====================

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

// ==================== Google Maps Service ====================

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
      libraries: ["places"],
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
      fields: ["displayName", "location", "formattedAddress"],
      maxResultCount: 20
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
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Initialize Google Maps
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
    }, 500);
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

  // Track dropdown position
  useLayoutEffect(() => {
    if (!containerRef.current || suggestions.length === 0) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [suggestions]);

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
      if (e.key === "Enter") {
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
        type: "simple",
        data: {
          type: "geojson",
          value: {
            type: "Feature",
            geometry: {
              coordinates: [lng, lat, 0],
              type: "Point"
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
          height: 3000,
          heading: 0,
          pitch: -1.5,
          roll: 0,
          fov: 1.0471975511965976
        },
        { duration: 2 }
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

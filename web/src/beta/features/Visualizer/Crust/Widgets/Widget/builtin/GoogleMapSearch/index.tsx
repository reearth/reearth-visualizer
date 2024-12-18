import { Loader } from "@googlemaps/js-api-loader";
import { Card } from "@reearth/beta/lib/reearth-widget-ui/components/ui/card";
import { Input } from "@reearth/beta/lib/reearth-widget-ui/components/ui/input";
import { useVisualizer } from "@reearth/core";
import { Search, Trash2, MapPin } from "lucide-react";
import { FC, useMemo, useState, useEffect, useCallback } from "react";

import type { ComponentProps as WidgetProps } from "../..";
import { CommonBuiltInWidgetProperty } from "../types";

type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiToken?: string;
  };
};
type GoogleMapSearchProps = WidgetProps<Property>;

let loaderInstance: Loader | null = null;

/**
 * Get a singleton instance of the Google Maps JS API Loader.
 * If it doesn't exist, create a new one with the given apiKey.
 * This ensures that the Loader is initialized only once and not repeatedly.
 */
function getLoaderInstance(apiKey: string): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      libraries: ["places"]
    });
  }
  return loaderInstance;
}

const GoogleMapSearch: FC<GoogleMapSearchProps> = ({
  widget,
  context: { onFlyTo } = {}
}) => {
  const theme = useMemo(
    () => widget.property?.appearance?.theme ?? "light",
    [widget.property?.appearance?.theme]
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const VisualizerRef = useVisualizer();

  // Load Google Maps API using the provided API key from widget properties
  useEffect(() => {
    if (!widget?.property?.default?.apiToken) return;
    const loader = getLoaderInstance(widget?.property?.default?.apiToken);
    loader
      .load()
      .then(() => {
        setGoogleLoaded(true);
      })
      .catch((err) => {
        setError("Failed to load Google Maps JS API: " + err);
      });
  }, [widget?.property?.default?.apiToken]);

  // Debounce mechanism: Wait for 3 seconds after user stops typing to trigger search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 3000);
    return () => clearTimeout(handler);
  }, [query]);

  /**
   * Fetch suggestions from Google Places API using textSearch.
   * Only triggers when Google Maps API is loaded and there is a non-empty search query.
   */
  const fetchSuggestions = useCallback(
    (searchText: string) => {
      if (!googleLoaded || !searchText) return;

      if (searchText.length === 0) {
        setFilteredSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      setFilteredSuggestions([]);

      // Use a new PlacesService instance pointing to a virtual div since we're not displaying the map
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      const request = {
        query: searchText
      };

      service.textSearch(request, (results, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setFilteredSuggestions(results);
        } else {
          setError("Failed to fetch suggestions.");
          setFilteredSuggestions([]);
        }
      });
    },
    [googleLoaded]
  );

  // When debounced query updates, fetch suggestions
  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
    },
    []
  );

  /**
   * Fly to a given lat/lng position with specified camera parameters.
   * This function is triggered after selecting a place or re-selecting from selected items.
   */
  const handleFlytoAndAddLayer = useCallback(
    (lat: number, lng: number) => {
      onFlyTo?.(
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
    [onFlyTo]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If user presses Enter, trigger immediate search
      if (e.key === "Enter") {
        setDebouncedQuery(query);
      }
    },
    [query]
  );

  /**
   * Handle selecting an item from the suggestions list.
   * 1. Get the location, add a layer marker at that location.
   * 2. Add the item to selectedItems and immediately select it.
   * 3. Fly to the selected location.
   */
  const handleSelectItem = useCallback(
    (item: any) => {
      const lat = item.geometry?.location?.lat();
      const lng = item.geometry?.location?.lng();

      const layer = VisualizerRef?.current?.layers?.add({
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
        },
        // Using a Base64 encoded marker image here
        marker: {
          style: "image",
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANTSURBVHgB7ZndThNBFMfP7PKRIoQiAdvGxOXCG7iQG7F+oMsb6BOoTyA8AfIG+ATWR/AJaCwgBZOWC7jxgsVgl2DUEk0Rmp3jnEUSEoE9szslMfZ31Sb/3f2fnTMzZ84CtGnzfyPAMFuum+5qBK4tpYOWSIcPkVhHENVfvR3VkWKxDgYxEgCZ7mnIFyjQVX/di9WiihJfgd0sZldWPEhIogBOjAPgNApIa17uCRSFa6vv5iABsQPw864jMFhQPx1IhoeiORV3NCyIwd7te+OWDCqQ3DzhWNhZ2VH3hBhojwCZR2EvxEiZKCP1pgymrq8tVzWv42Mwbc5DO520UsjCYBZaZ55QL6jztc4F7BHw8w9ctWoswCWAAU5lPywWOdoOYKLMz3K1zSCAeuMAvvz8Ef5Pp3ogl+7nXg7CDp9VZGk5oj+5v8XRftzbg81dPwziND1dXTCWycKNwUHObaDbDpyB5eXtKB1rDghsPuboNn0f1j/v/GWeaBwdwdqn7VDD4TAQTzg65iQWj6IUZJDefBSkOUmti5BgucCAFwBGrzwbfg24eF+/RWqUsVvAgBeAEJG7ZG1/H7jU9lkFqcMRxSolzuKsvDehjcJYAJ223RJtFNwAvChBrp9fGjG1HkdkLABn8CpwGctmGSr0GCJuALgepRjq7YNRhjHS0KYWhQSIfCbBKiVQiqpghDqqdtorytyG2qxoXzgN5T2Zvzk0DBxsFEWOjlVKbI276VR38B00oKWS6iFiqK83rId0Ju9Byh7gNADY1ejunUmqRF24BFT6vM2VS6zyhb2Mqo5DosO3DjZCgavVOpGpUaCK1IHW4mXKpRGuWGsjU+fglo+C7jO0D/W7Ew8rqr6O1UFgoPX2Ce1SAi05Ay1CzbPnoIl2ANkVOquq1qBhVCoUju+tR6xi7uCw4yUwaxUmXiNlxxrZ2K1FanBJy66AAVQvaORSW4vEsOqgSSPzQc4k6VInOg/k3i/NJ9ngEHEuU16ahwQY+T7gT0wWhICnOtcgwpvsaukZJMTYFxqdIEyZJ4x+YuIEYdI8YexMTBwbO3+PMG2eMBoAkSkvTp81sWnCmjZPGP9KeULt7v1pO7DChrC0QC2VpQL8a1BT2M/nHWjTpk3L+A15aUf5fJUbQAAAAABJRU5ErkJggg=="
        }
      });

      // Add the new item to the list, select it, and reset the search states
      setSelectedItems((prev) => {
        const newItems = [...prev, { ...item, layerId: layer?.id }];
        setSelectedItemIndex(newItems.length - 1);
        return newItems;
      });
      setDebouncedQuery("");
      setQuery("");
      setFilteredSuggestions([]);
      handleFlytoAndAddLayer(lat, lng);
    },
    [VisualizerRef, handleFlytoAndAddLayer]
  );

  /**
   * Handle selecting from already selected items.
   * 1. Update selectedItemIndex to the clicked item's index.
   * 2. Fly to that item's location.
   */
  const handleSelectFromSelectedItems = useCallback(
    (item: any, index: number) => {
      setSelectedItemIndex(index);
      handleFlytoAndAddLayer(
        item.geometry?.location?.lat(),
        item.geometry?.location?.lng()
      );
    },
    [handleFlytoAndAddLayer]
  );

  /**
   * Handle deleting an item from the selectedItems list.
   * 1. Remove the item from the array.
   * 2. Adjust the selectedItemIndex if necessary:
   *    - If deleting the currently selected item, choose a new item to select if possible.
   *    - If there are no items left, set selectedItemIndex to null.
   * 3. Delete the corresponding layer from the visualizer.
   * 4. 在找到新的选中项后，调用 handleSelectFromSelectedItems。
   */
  const handleDeleteItem = useCallback(
    (index: number, layerId: string) => {
      setSelectedItems((prev) => {
        const newItems = prev.filter((_, i) => i !== index);

        let newSelectedIndex: number | null = selectedItemIndex;

        // If the deleted item is the currently selected one
        if (selectedItemIndex === index) {
          // If there are still items left after deletion
          if (newItems.length > 0) {
            // Try to select the item now at the same index (if it exists)
            if (index < newItems.length) {
              newSelectedIndex = index;
            } else {
              // If we deleted the last item, select the new last item
              newSelectedIndex = newItems.length - 1;
            }
          } else {
            // No items left, no selection
            newSelectedIndex = null;
          }
        } else if (selectedItemIndex !== null && selectedItemIndex > index) {
          // If the deleted item was before the currently selected item, shift the index by -1
          newSelectedIndex = selectedItemIndex - 1;
        }

        setSelectedItemIndex(newSelectedIndex);

        if (newSelectedIndex !== null && newItems[newSelectedIndex]) {
          handleSelectFromSelectedItems(
            newItems[newSelectedIndex],
            newSelectedIndex
          );
        }

        return newItems;
      });

      // Delete the corresponding layer from the scene
      VisualizerRef?.current?.layers?.deleteLayer(layerId);
    },
    [VisualizerRef, selectedItemIndex, handleSelectFromSelectedItems]
  );

  return (
    <div className={theme}>
      <Card className="tw-pl-3 tw-w-[400px] tw-flex tw-flex-col tw-bg-background tw-text-foreground tw-rounded-md tw-border-0">
        <div className="tw-flex tw-items-center">
          <span className="tw-text-foreground">
            <Search className="tw-w-5 tw-h-5" />
          </span>
          <Input
            className="tw-border-0"
            placeholder="Type a keyword to search..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {loading && <p className="tw-text-gray-500 tw-mt-2">Loading...</p>}
        {error && <p className="tw-text-red-500 tw-mt-2">{error}</p>}
        {filteredSuggestions.length > 0 && (
          <ul className="tw-mt-2 tw-bg-white tw-rounded-md tw-shadow-lg tw-max-h-60 tw-overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="tw-px-4 tw-py-2 tw-cursor-pointer hover:tw-bg-gray-200 tw-bg-white"
                onClick={() => handleSelectItem(suggestion)}
              >
                {`${suggestion.formatted_address}, ${suggestion.name}`}
              </li>
            ))}
          </ul>
        )}

        {selectedItems.length > 0 && (
          <div className="tw-mt-2 tw-mb-2 tw-space-y-2">
            {selectedItems.map((item, index) => {
              const isSelected = index === selectedItemIndex;
              return (
                <div
                  key={index}
                  className={`tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-rounded-md tw-cursor-pointer ${
                    isSelected
                      ? "tw-bg-gray-200"
                      : "tw-bg-white hover:tw-bg-gray-200"
                  }`}
                  onClick={() => handleSelectFromSelectedItems(item, index)}
                >
                  <div className="tw-flex tw-items-center">
                    <MapPin className="tw-w-5 tw-h-5 tw-mr-2 tw-flex-shrink-0" />
                    <span>{`${item.formatted_address}, ${item.name}`}</span>
                  </div>
                  <Trash2
                    className="tw-w-5 tw-h-5 tw-cursor-pointer hover:tw-text-red-500 tw-flex-shrink-0"
                    onClick={(e) => {
                      // Prevent triggering the parent onClick event when clicking the Trash icon
                      e.stopPropagation();
                      handleDeleteItem(index, item.layerId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GoogleMapSearch;
